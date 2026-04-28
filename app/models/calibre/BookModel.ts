import { type Instance, type SnapshotIn, type SnapshotOut, flow, types } from "mobx-state-tree"

import type { ConvertOptions } from "@/components/BookConvertForm/ConvertOptions"
import { isCalibreHtmlViewerFormat } from "@/utils/calibreHtmlViewer"
import { camelCaseToLowerCase } from "@/utils/convert"
import { convertOptionsToParams } from "@/utils/convertOptionsToParams"
import { delay } from "@/utils/delay"
import {
  type ApiBookManifestResultType,
  type HtmlFileType,
  type ImageFileType,
  type LastReadPosition,
  api,
} from "../../services/api"
import type { AddedFormatEntry, AnnotationsMap, MetadataFieldKey } from "../../services/api/api.types"
import { handleCommonApiError } from "../errors/errors"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { type Annotation, AnnotationModel } from "./AnnotationModel"
import { MetadataModel } from "./MetadataModel"

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
  data: {
    running: false
    ok: boolean
    was_aborted: boolean
    traceback: string
    log: string
    size?: number
    fmt?: string
  }
} {
  return response.kind === "ok" && response.data.running === false
}

export type TocItem = {
  title?: string
  dest?: string
  flag?: string
  children: TocItem[]
  id?: number
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
    annotations: types.array(AnnotationModel),
    /**
     * Most recent server-side reading position (0–1) extracted from
     * `last_read_positions` in the book manifest.  Reset on each manifest load.
     */
    manifestServerPosFrac: types.maybeNull(types.number),
    manifestServerEpoch: types.maybeNull(types.number),
    manifestToc: types.maybeNull(types.frozen<TocItem>()),
    /**
     * Calibre manifest total_length: sum of spine file content lengths in bytes.
     * For HTML spine files (TextBook), this represents the total readable content size,
     * NOT the page count (which varies by rendering). Used to calculate proper page counts
     * for resume reading.
     */
    totalLength: types.maybeNull(types.number),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    setAnnotations(map: AnnotationsMap) {
      const all: Annotation[] = []
      for (const ann of map.highlight ?? []) {
        if (ann.removed) continue
        all.push(
          AnnotationModel.create({
            uuid: ann.uuid,
            type: "highlight",
            spineIndex: ann.spine_index,
            spineName: ann.spine_name,
            startCfi: ann.start_cfi ?? null,
            endCfi: ann.end_cfi ?? null,
            highlightedText: ann.highlighted_text ?? null,
            notes: ann.notes ?? null,
            styleKind: ann.style?.kind ?? null,
            styleWhich: ann.style?.which ?? "yellow",
            timestamp: ann.timestamp,
            title: null,
            posFrac: ann.pos_frac,
          }),
        )
      }
      for (const ann of map.bookmark ?? []) {
        if (ann.removed) continue
        all.push(
          AnnotationModel.create({
            uuid: ann.uuid,
            type: "bookmark",
            spineIndex: ann.spine_index,
            spineName: ann.spine_name,
            startCfi: ann.start_cfi ?? null,
            endCfi: null,
            highlightedText: null,
            notes: ann.notes ?? null,
            styleKind: null,
            styleWhich: null,
            timestamp: ann.timestamp,
            title: ann.title ?? null,
            posFrac: ann.pos_frac,
          }),
        )
      }
      self.annotations.replace(all)
    },
    setManifestToc(toc: TocItem | null) {
      self.setProp("manifestToc", toc)
    },
  }))
  .actions((root) => ({
    startConvert: flow(function* (
      format: string,
      libraryId: string,
      convertOptions?: ConvertOptions,
    ) {
      const convertParams = convertOptions ? convertOptionsToParams(convertOptions) : undefined
      const inputFmt = convertOptions?.inputFormat

      if (!inputFmt) {
        throw new Error("No input format specified")
      }

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

      return startResponse.data
    }),
    convert: flow(function* (
      format: string,
      libraryId: string,
      onPostConvert: (comicMetadata?: {
        isComic: boolean
        rasterCoverName: string | null
        totalLength: number | null
        fileMetadata: Record<string, ImageFileType | HtmlFileType> | null
      }) => void | Promise<void>,
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
        // AZW3 / KF8 / KF8:joint → HTML spine files rendered by BookHtmlPage
        pathList.push(...result.spine)
      } else if (result.book_format === "EPUB") {
        // EPUB → pre-rendered JPEG images from files metadata
        // This is faster than the old approach because:
        // 1. No extra API call (getLibraryInformation) needed
        // 2. No DOM parsing overhead
        // 3. Natural filename sorting for proper page order
        // 4. Raster cover name detection
        const imagePaths = Object.entries(result.files)
          .filter(([_, metadata]) => !metadata.is_html && metadata.mimetype?.startsWith("image/"))
          .map(([path]) => path)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))

        if (result.raster_cover_name && imagePaths.includes(result.raster_cover_name)) {
          const coverIndex = imagePaths.indexOf(result.raster_cover_name)
          if (coverIndex > 0) {
            imagePaths.splice(coverIndex, 1)
            imagePaths.unshift(result.raster_cover_name)
          }
        }

        pathList.push(...imagePaths)
      } else if (result.is_comic) {
        // Comic formats (CBZ, CBR, CB7, CBC, …) → use files metadata directly
        // This is faster than parsing XHTML DOM because:
        // 1. No DOM parsing overhead
        // 2. Natural filename sorting for proper page order
        // 3. Raster cover name detection
        const imagePaths = Object.entries(result.files)
          .filter(([_, metadata]) => !metadata.is_html && metadata.mimetype?.startsWith("image/"))
          .map(([path]) => path)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))

        if (result.raster_cover_name && imagePaths.includes(result.raster_cover_name)) {
          const coverIndex = imagePaths.indexOf(result.raster_cover_name)
          if (coverIndex > 0) {
            imagePaths.splice(coverIndex, 1)
            imagePaths.unshift(result.raster_cover_name)
          }
        }

        pathList.push(...imagePaths)
      } else {
        // All other text-based formats (MOBI old, FB2, RTF, DOCX, TXT, HTML, …)
        // Calibre renders these as XHTML spine files; use HTML viewer path.
        pathList.push(...result.spine)
      }

      root.setProp("path", pathList)
      root.setProp("hash", result.book_hash.mtime)
      root.setProp("totalLength", result.total_length ?? null)

      if (result.page_progression_direction) {
        root.setProp("pageProgressionDirection", result.page_progression_direction)
      }

      root.setAnnotations(result.annotations_map ?? {})
      root.setManifestToc(result.toc ?? null)

      // Extract the most recent server-side reading position from the manifest.
      const positions = Array.isArray(result.last_read_positions)
        ? (result.last_read_positions as Array<LastReadPosition | number>)
        : []
      const latestPosition = positions.reduce<LastReadPosition | null>((best, cur) => {
        if (typeof cur === "number") return best
        if (!best || cur.epoch > best.epoch) return cur
        return best
      }, null)
      root.setProp("manifestServerPosFrac", latestPosition ? latestPosition.pos_frac : null)
      root.setProp("manifestServerEpoch", latestPosition ? latestPosition.epoch : null)

      // Pass image-based format metadata to onPostConvert for caching in ReadingHistory
      const isImageBasedFormat = result.is_comic || result.book_format === "EPUB"
      const formatMetadata = isImageBasedFormat
        ? {
            isComic: result.is_comic,
            rasterCoverName: result.raster_cover_name ?? null,
            totalLength: result.total_length ?? null,
            fileMetadata: result.files ?? null,
          }
        : undefined

      const postConvertResult = onPostConvert(formatMetadata)
      if (postConvertResult) {
        yield postConvertResult
      }
    }),
    update: flow(function* (
      libraryId: string,
      updateInfo: Partial<SnapshotIn<typeof MetadataModel>>,
      updateField: string[],
      formatChanges?: {
        removed_formats?: string[]
        added_formats?: AddedFormatEntry[]
      },
    ) {
      const changes: Partial<Record<MetadataFieldKey, unknown>> = {}

      // Skip "formats" and "customColumns" from regular field changes
      const regularFields = updateField.filter((f) => f !== "formats" && f !== "customColumns")

      regularFields.map((field: string) => {
        const fieldValue = normalizeUpdateFieldValue(
          field,
          updateInfo[field as keyof SnapshotIn<typeof MetadataModel>],
        )
        ;(root.metaData as unknown as Record<string, unknown>)[field] = fieldValue
        const apiField = camelCaseToLowerCase(field) as MetadataFieldKey
        changes[apiField] = Array.isArray(fieldValue)
          ? fieldValue
              .map((entry) => `${entry}`.trim())
              .filter(Boolean)
              .join("\n")
          : fieldValue
      })

      // Serialize custom column updates: each key is camelCase label → convert to #snake_case
      if (updateField.includes("customColumns") && updateInfo.customColumns) {
        const customColumnsData = updateInfo.customColumns as Record<string, unknown>
        for (const [camelKey, value] of Object.entries(customColumnsData)) {
          const apiKey = camelCaseToLowerCase(camelKey) as MetadataFieldKey
          changes[apiKey] = Array.isArray(value)
            ? value
                .map((entry) => `${entry}`.trim())
                .filter(Boolean)
                .join("\n")
            : value
        }
      }

      if (formatChanges?.removed_formats?.length) {
        ;(changes as Record<string, unknown>).removed_formats = formatChanges.removed_formats
      }
      if (formatChanges?.added_formats?.length) {
        ;(changes as Record<string, unknown>).added_formats = formatChanges.added_formats
      }

      const response = yield api.editBook(libraryId, root.id, {
        changes: changes as Partial<Record<MetadataFieldKey, unknown>>,
        loaded_book_ids: [root.id],
      })
      if (response.kind === "ok") {
        // Update regular fields
        regularFields.map((field: string) => {
          ;(root.metaData as unknown as Record<string, unknown>)[field] = normalizeUpdateFieldValue(
            field,
            updateInfo[field as keyof SnapshotIn<typeof MetadataModel>],
          )
        })
        // Update custom columns locally
        if (updateField.includes("customColumns") && updateInfo.customColumns && root.metaData) {
          const customColumnsData = updateInfo.customColumns as Record<string, unknown>
          for (const [camelKey, value] of Object.entries(customColumnsData)) {
            root.metaData.customColumns.set(camelKey, value)
          }
        }
        // Update local formats list if format changes were made
        if (formatChanges?.removed_formats?.length || formatChanges?.added_formats?.length) {
          const currentFormats = [...(root.metaData?.formats ?? [])]
          const removed = new Set(
            (formatChanges?.removed_formats ?? []).map((f) => f.toUpperCase()),
          )
          const remaining = currentFormats.filter((f) => !removed.has(f.toUpperCase()))
          const added = (formatChanges?.added_formats ?? []).map((f) => f.ext.toUpperCase())
          const merged = [...new Set([...remaining, ...added])]
          ;(root.metaData as unknown as Record<string, unknown>).formats = merged
        }
        return true
      }
      handleCommonApiError(response)
      return false
    }),
  }))
export type Book = Instance<typeof BookModel>
export type BookSnapshotOut = SnapshotOut<typeof BookModel>
export type BookSnapshotIn = SnapshotIn<typeof BookModel>
