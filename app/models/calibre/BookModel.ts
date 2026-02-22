import {
  type Instance,
  type SnapshotIn,
  type SnapshotOut,
  flow,
  getParent,
  types,
} from "mobx-state-tree"

import { camelCaseToLowerCase, lowerCaseToCamelCase } from "@/utils/convert"
import { delay } from "@/utils/delay"
import { type ApiBookManifestResultType, api } from "../../services/api"
import { type Metadata, MetadataModel, type ReadingHistory } from "../calibre"
import { handleCommonApiError } from "../errors/errors"
import { withSetPropAction } from "../helpers/withSetPropAction"

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
    ) {
      let response
      while (response?.data?.files === undefined) {
        response = yield api.CheckBookConverting(libraryId, root.id, format)

        if (response.kind !== "ok") {
          if (response.kind === "not-found") {
            throw new Error(response.message)
          }
          handleCommonApiError(response)
        } else if ("job_status" in response.data) {
          if (response.data.job_status === "finished") {
            if (response.data.traceback) {
              throw new Error(response.data.traceback)
            }
          }
        }

        yield delay(6000)
      }

      const pathList = []

      const result: ApiBookManifestResultType = response.data

      if (result.book_format !== "KF8") {
        const spineResponse = yield api.getLibraryInformation(
          libraryId,
          root.id,
          result.book_format,
          root.metaData.size,
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

        if (response.data.book_format === "EPUB") {
          Object.values(response.data.spine).forEach((value: string, index) => {
            if (index !== 0) {
              const pagePath = value
                .replace(".xhtml", ".jpg")
                .replace("xhtml", "image")
                .replace("text", "image")

              const prefixImagePath = pagePath.replace("p", "i")

              if (response.data.files[prefixImagePath]) {
                pathList.push(prefixImagePath)
                return
              }

              const numberOnlyPath = pagePath.replace("p-", "")
              if (response.data.files[numberOnlyPath]) {
                pathList.push(numberOnlyPath)
                return
              }
              pathList.push(pagePath)
            }
          })
        }
      } else {
        for (const value of Object.values(response.data.spine)) {
          pathList.push(value)
        }
      }

      root.setProp("path", pathList)
      root.setProp("hash", response.data.book_hash.mtime)

      if (response.data.page_progression_direction) {
        root.setProp("pageProgressionDirection", response.data.page_progression_direction)
      }
      yield onPostConvert()
    }),
    update: flow(function* (libraryId: string, updateInfo: Metadata, updateField: string[]) {
      const changes = {}

      const rootParent = getParent(root) as Array<Book>
      updateField.map((field: string) => {
        root.metaData[field] = updateInfo[field]
        changes[camelCaseToLowerCase(field)] = updateInfo[field]
      })
      const response = yield api.editBook(libraryId, root.id, {
        changes,
        loaded_book_ids: [root.id],
      })
      if (response.kind === "ok") {
        updateField.map((field: string) => {
          root.metaData[field] = updateInfo[field]
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
