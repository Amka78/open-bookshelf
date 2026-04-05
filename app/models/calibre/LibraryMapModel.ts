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
    ftsEnabled: types.optional(types.boolean, false),
    savedSearches: types.optional(
      types.array(types.model({ name: types.string, query: types.string })),
      [],
    ),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    seriesBooksFor(bookId: number) {
      const series = self.books.get(bookId.toString())?.metaData?.series
      if (!series) return []
      return Array.from(self.books.values())
        .filter((b) => b.metaData?.series === series)
        .sort((a, b) => (a.metaData?.seriesIndex ?? 0) - (b.metaData?.seriesIndex ?? 0))
    },
  }))
  .actions((root) => ({
    setBook: (bookId?: number) => {
      // MST resolves references by identifier at runtime; TS types don't allow direct ID assignment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    addSavedSearch: (name: string, query: string) => {
      if (!root.savedSearches.find((s) => s.name === name)) {
        root.savedSearches.push({ name, query })
      }
    },
    removeSavedSearch: (name: string) => {
      const idx = root.savedSearches.findIndex((s) => s.name === name)
      if (idx >= 0) root.savedSearches.splice(idx, 1)
    },
  }))

export type LibraryMap = Instance<typeof LibraryMapModel>
export type LibraryMapSnapshotOut = SnapshotOut<typeof LibraryMapModel>
export type LibraryMapSnapshotIn = SnapshotIn<typeof LibraryMapModel>
