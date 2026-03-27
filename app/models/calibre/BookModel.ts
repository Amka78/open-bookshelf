import {
  type Instance,
  type SnapshotIn,
  type SnapshotOut,
  flow,
  getParent,
  types,
} from "mobx-state-tree"

import type { ConvertOptions } from "@/components/BookConvertForm/ConvertOptions"
import { isCalibreHtmlViewerFormat } from "@/utils/calibreHtmlViewer"
import { camelCaseToLowerCase, lowerCaseToCamelCase } from "@/utils/convert"
import { convertOptionsToParams } from "@/utils/convertOptionsToParams"
import { delay } from "@/utils/delay"
import { type ApiBookManifestResultType, type CommonFieldName, api } from "../../services/api"
import { type Metadata, MetadataModel, type ReadingHistory } from "../calibre"
import { handleCommonApiError } from "../errors/errors"
import { withSetPropAction } from "../helpers/withSetPropAction"

type BookManifestResponse = Awaited<ReturnType<typeof api.CheckBookConverting>>
type ConversionStatusResponse = Awaited<ReturnType<typeof api.getConversionStatus>>

function normalizeUpdateFieldValue(field: string, value: unknown) {
  if (field === "seriesIndex") {
    if (value === null || value === undefined || value === "") {
      return null
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null
    }

    const parsed = Number(String(value).trim())
    return Number.isFinite(parsed) ? parsed : null
  }

  return value
}

function shouldUseHtmlViewer(requestedFormat: string, manifest: ApiBookManifestResultType) {
  return (
    isCalibreHtmlViewerFormat(requestedFormat) || isCalibreHtmlViewerFormat(manifest.book_format)
  )
}

function isConvertManifestResponse(
  response: BookManifestResponse,
): response is { kind: "ok"; data: ApiBookManifestResultType } {
  return response.kind === "ok" && "files" in response.data
}

function isConvertJobStatusResponse(
  response: BookManifestResponse,
): response is { kind: "ok"; data: { job_status: "waiting" | "finished"; traceback?: string } } {
  return response.kind === "ok" && "job_status" in response.data
}

function isConversionRunningResponse(
  response: ConversionStatusResponse,
): response is { kind: "ok"; data: { running: true; percent: number; msg: string } } {
  return response.kind === "ok" && response.data.running === true
}

function isConversionFinishedResponse(response: ConversionStatusResponse): response is {
  kind: "ok"
  data: { running: false; ok: boolean; was_aborted: boolean; traceback: string; log: string }
} {
  return response.kind === "ok" && response.data.running === false
}

export const BookModel = types
  .model("BookModel")
  .props({
    id: types.identifierNumber,
    metaData: types.maybeNull(MetadataModel),
    path: types.array(types.string),
    hash: types.maybeNull(types.number),
    pageProgressionDirection: types.maybeNull(
      types.union(types.literal("rtl"), types.literal("ltr")),
    ),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    convert: flow(function* (
      format: string,
      libraryId: string,
      onPostConvert: () => void | Promise<void>,
      convertOptions?: ConvertOptions,
    ) {
      const convertParams = convertOptions ? convertOptionsToParams(convertOptions) : undefined
      const inputFmt = convertOptions?.inputFormat
      let response: BookManifestResponse | undefined

      if (inputFmt) {
        const startResponse = yield api.startConversion(
          libraryId,
          root.id,
          inputFmt,
          format,
          convertParams,
        )

        if (startResponse.kind !== "ok") {
          if (startResponse.kind === "not-found") {
            throw new Error(startResponse.message)
          }
          handleCommonApiError(startResponse)
          return
        }

        while (true) {
          const statusResponse: ConversionStatusResponse = yield api.getConversionStatus(
            libraryId,
            startResponse.data,
          )

          if (statusResponse.kind !== "ok") {
            if (statusResponse.kind === "not-found") {
              throw new Error(statusResponse.message)
            }
            handleCommonApiError(statusResponse)
            return
          }

          if (isConversionRunningResponse(statusResponse)) {
            yield delay(6000)
            continue
          }

          if (!isConversionFinishedResponse(statusResponse)) {
            yield delay(6000)
            continue
          }

          if (!statusResponse.data.ok) {
            throw new Error(
              statusResponse.data.traceback ||
                statusResponse.data.log ||
                (statusResponse.data.was_aborted ? "Conversion aborted" : "Conversion failed"),
            )
          }

          break
        }
      }

      while (!response || !isConvertManifestResponse(response)) {
        response = yield api.CheckBookConverting(libraryId, root.id, format)

        if (response.kind !== "ok") {
          if (response.kind === "not-found") {
            throw new Error(response.message)
          }
          handleCommonApiError(response)
        } else if (isConvertJobStatusResponse(response)) {
          if (response.data.job_status === "finished" && response.data.traceback) {
            throw new Error(response.data.traceback)
          }
        }

        yield delay(6000)
      }

      const pathList = []

      const result: ApiBookManifestResultType = response.data

      if (shouldUseHtmlViewer(format, result)) {
        pathList.push(...result.spine)
      } else if (result.book_format !== "KF8") {
        const spineResponse = yield api.getLibraryInformation(
          libraryId,
          root.id,
          result.book_format,
          root.metaData?.size ?? 0,
          result.book_hash.mtime,
          result.spine[0],
        )

        if (spineResponse.kind === "ok") {
          Object.values(spineResponse.data.tree.c[1].c).forEach((path: { a: unknown }) => {
            Object.values(path.a).forEach((avalue) => {
              if (avalue[0] === "data-calibre-src") {
                pathList.push(avalue[1])
              }
            })
          })
        }

        if (result.book_format === "EPUB") {
          Object.values(result.spine).forEach((value: string, index) => {
            if (index !== 0) {
              const pagePath = value
                .replace(".xhtml", ".jpg")
                .replace("xhtml", "image")
                .replace("text", "image")

              const prefixImagePath = pagePath.replace("p", "i")

              if (result.files[prefixImagePath]) {
                pathList.push(prefixImagePath)
                return
              }

              const numberOnlyPath = pagePath.replace("p-", "")
              if (result.files[numberOnlyPath]) {
                pathList.push(numberOnlyPath)
                return
              }
              pathList.push(pagePath)
            }
          })
        }
      } else {
        for (const value of Object.values(result.spine)) {
          pathList.push(value)
        }
      }

      root.setProp("path", pathList)
      root.setProp("hash", result.book_hash.mtime)

      if (result.page_progression_direction) {
        root.setProp("pageProgressionDirection", result.page_progression_direction)
      }

      const postConvertResult = onPostConvert()
      if (postConvertResult) {
        yield postConvertResult
      }
    }),
    update: flow(function* (
      libraryId: string,
      updateInfo: Partial<SnapshotIn<typeof MetadataModel>>,
      updateField: string[],
    ) {
      const changes: Partial<Record<CommonFieldName, unknown>> = {}

      const rootParent = getParent(root) as Array<Book>
      updateField.map((field: string) => {
        const fieldValue = normalizeUpdateFieldValue(field, updateInfo[field])
        root.metaData[field] = fieldValue
        const apiField = camelCaseToLowerCase(field) as CommonFieldName
        changes[apiField] = Array.isArray(fieldValue)
          ? fieldValue
              .map((entry) => `${entry}`.trim())
              .filter(Boolean)
              .join("\n")
          : fieldValue
      })
      const response = yield api.editBook(libraryId, root.id, {
        changes: changes as Record<CommonFieldName, unknown>,
        loaded_book_ids: [root.id],
      })
      if (response.kind === "ok") {
        updateField.map((field: string) => {
          root.metaData[field] = normalizeUpdateFieldValue(field, updateInfo[field])
        })
        return true
      }
      handleCommonApiError(response)
      return false
    }),
  }))
export type Book = Instance<typeof BookModel>
export type BookSnapshotOut = SnapshotOut<typeof BookModel>
export type BookSnapshotIn = SnapshotIn<typeof BookModel>
