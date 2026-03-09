import { type Instance, type SnapshotIn, type SnapshotOut, flow, types } from "mobx-state-tree"

import { api } from "@/services/api"
import { handleCommonApiError } from "../errors/errors"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { BookModel } from "./BookModel"
import { CategoryModel } from "./CategoryModel"
import { ClientSettingModel } from "./ClientSettingModel"
import { FieldMetadataModel } from "./FieldMetadataModel"
import { SearchSettingModel } from "./SearchSettingModel"
import { SortFieldModel } from "./SortFieldModel"
import { VirtualLibraryModel } from "./VirtualLibraryModel"

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
    selectedBook: types.safeReference(types.late(() => BookModel)),
    virtualLibraries: types.array(VirtualLibraryModel),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    setBook: (bookId?: number) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      root.selectedBook = bookId as any
    },
    deleteBook: flow(function* (bookId: number) {
      const response = yield api.deleteBook(root.id, bookId)
      if (response.kind === "ok") {
        root.selectedBook = undefined
        root.books.delete(bookId.toString())
        return true
      }
      handleCommonApiError(response)
      return false
    }),
  }))

export type LibraryMap = Instance<typeof LibraryMapModel>
export type LibraryMapSnapshotOut = SnapshotOut<typeof LibraryMapModel>
export type LibraryMapSnapshotIn = SnapshotIn<typeof LibraryMapModel>
