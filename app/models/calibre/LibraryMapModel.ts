import { type Instance, type SnapshotIn, type SnapshotOut, flow, types } from "mobx-state-tree"

import { api } from "@/services/api"
import {
  BookModel,
  CategoryModel,
  ClientSettingModel,
  FieldMetadataModel,
  type ReadingHistory,
  ReadingHistoryModel,
  SearchSettingModel,
  SortFieldModel,
} from "./"
import { handleCommonApiError } from "../errors/errors"
import { withSetPropAction } from "../helpers/withSetPropAction"

export const LibraryMapModel = types
  .model("LibrayMapModel")
  .props({
    id: types.identifier,
    books: types.map(BookModel),
    searchSetting: types.maybeNull(SearchSettingModel),
    sortField: types.array(SortFieldModel),
    tagBrowser: types.array(CategoryModel),
    clientSetting: types.array(ClientSettingModel),
    bookDisplayFields: types.array(types.string),
    fieldMetadataList: types.map(FieldMetadataModel),
    selectedBook: types.maybe(types.reference(types.late(() => BookModel))),
    readingHistory: types.array(ReadingHistoryModel),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    deleteBook: flow(function* (bookId: number) {
      const response = yield api.deleteBook(root.id, bookId)
      if (response.kind === "ok") {
        root.books.delete(bookId.toString())
        return true
      }
      handleCommonApiError(response)
      return false
    }),
    setBook: (bookId?: number) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      root.selectedBook = bookId as any
    },
    addReadingHistory: (model: ReadingHistory) => {
      root.readingHistory.push(model)
    },
  }))

export type LibraryMap = Instance<typeof LibraryMapModel>
export type LibraryMapSnapshotOut = SnapshotOut<typeof LibraryMapModel>
export type LibraryMapSnapshotIn = SnapshotIn<typeof LibraryMapModel>
