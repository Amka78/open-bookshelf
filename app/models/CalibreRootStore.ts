import {
  type Instance,
  type SnapshotIn,
  type SnapshotOut,
  flow,
  types,
  getParent,
} from "mobx-state-tree"

import { delay } from "@/utils/delay"
import {
  type ApiBookInfo,
  type ApiBookInfoCore,
  type ApiBookManifestResultType,
  api,
} from "../services/api"
import {
  CategoryModel,
  ClientSettingModel,
  DateFormatModel,
  FieldMetadataModel,
  IsMultipleModel,
  MetadataModel,
  NodeModel,
  type ReadingHistory,
  ReadingHistoryModel,
  SearchSettingModel,
  SortFieldModel,
  SubCategoryModel,
} from "./calibre"
import { handleCommonApiError } from "./errors/errors"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { camelCaseToLowerCase, lowerCaseToCamelCase } from "@/utils/convert"
import type { Metadata } from "./calibre"

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
    convert: flow(function* (format: string, libraryId: string, onPostConvert: () => void) {
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
      onPostConvert()
    }),
    update: flow(function* (libraryId: string, updateInfo: Metadata, updateField: string[]) {
      const changes = {}

      const loaded_book_ids: number[] = []

      const rootParent = getParent(root) as Array<Book>

      Object.keys(rootParent).forEach((key) => {
        loaded_book_ids.push(rootParent[key].id)
      })
      updateField.map((field: string) => {
        root.metaData[field] = updateInfo[field]
        changes[camelCaseToLowerCase(field)] = updateInfo[field]
      })
      const response = yield api.editBook(libraryId, root.id, {
        changes,
        loaded_book_ids,
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

/**
 * Calibre Root Information
 */
export const CalibreRootStore = types
  .model("CalibreRootStore")
  .props({
    defaultLibraryId: types.maybeNull(types.string),
    numPerPage: types.maybeNull(types.number),
    libraryMap: types.map(LibraryMapModel),
    selectedLibrary: types.maybe(types.reference(types.late(() => LibraryMapModel))),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    initialize: flow(function* () {
      const response = yield api.initializeCalibre()
      if (response.kind === "ok") {
        root.defaultLibraryId = response.data.default_library_id
        root.numPerPage = response.data.num_per_page

        root.libraryMap.clear()
        Object.keys(response.data.library_map).forEach((keyName: string) => {
          root.libraryMap.set(keyName, { id: keyName })
        })

        return true
      }
      handleCommonApiError(response)
      return false
    }),
    getTagBrowser: flow(function* () {
      const response = yield api.getTagBrowser(root.defaultLibraryId)
      if (response.kind === "ok") {
        root.selectedLibrary.tagBrowser.clear()

        Object.values(response.data.root.children).forEach(
          (value: { id; children: { id; children }[] }) => {
            const category = response.data.item_map[value.id]

            const categoryModel = CategoryModel.create({
              category: category.category,
              count: category.count,
              isCategory: category.is_category,
              isEditable: category.is_editable,
              isSearchable: category.is_searchable,
              name: category.name,
              tooltip: category.tooltip,
            })

            const subCategoryArray = []
            Object.values(value.children).forEach((subValue) => {
              const subCateogy = response.data.item_map[subValue.id]
              const subCategoryModel = SubCategoryModel.create({
                category: subCateogy.category,
                count: subCateogy.count,
                isCategory: subCateogy.is_category,
                isSearchable: subCateogy.is_searchable,
                name: subCateogy.name,
              })

              const nodeArray = []
              Object.values(subValue.children).forEach((nodeValue: { id }) => {
                const node = response.data.item_map[nodeValue.id]

                const nodeModel = NodeModel.create({
                  avgRating: node.avg_rating,
                  count: node.count,
                  id: node.id,
                  name: node.name,
                })

                nodeArray.push(nodeModel)
              })
              subCategoryModel.setProp("children", nodeArray)
              subCategoryArray.push(subCategoryModel)
            })

            categoryModel.setProp("subCategory", subCategoryArray)
            root.selectedLibrary.tagBrowser.push(categoryModel)
          },
        )
        return true
      }
      handleCommonApiError(response)
      return false
    }),
    searchLibrary: flow(function* () {
      const response = yield api.getLibrary(
        root.selectedLibrary.id,
        root.selectedLibrary.searchSetting ? root.selectedLibrary.searchSetting.query : "",
        root.selectedLibrary.searchSetting ? root.selectedLibrary.searchSetting.sort : "timestamp",
        root.selectedLibrary.searchSetting ? root.selectedLibrary.searchSetting.sortOrder : "desc",
      )

      if (response.kind === "ok") {
        root.selectedLibrary.books.clear()
        convertLibraryInformation(response.data, root.selectedLibrary)
        convertSearchResult(response.data, root.selectedLibrary)

        return true
      }
      handleCommonApiError(response)
      return false
    }),
    searchMoreLibrary: flow(function* () {
      const selectedLibrary = root.selectedLibrary
      const response = yield api.getMoreLibrary(root.selectedLibrary.id, {
        offset: selectedLibrary.searchSetting.offset,
        query: selectedLibrary.searchSetting.query ? selectedLibrary.searchSetting.query : "",
        sort: selectedLibrary.searchSetting.sort,
        sort_order: selectedLibrary.searchSetting.sortOrder,
        vl: "",
      })

      if (response.kind === "ok") {
        convertSearchResult(response.data, selectedLibrary)
        return true
      }
      handleCommonApiError(response)
      return false
    }),
    setLibrary: (libraryId?: string) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      root.selectedLibrary = libraryId as any
    },
  }))

export type CalibreRoot = Instance<typeof CalibreRootStore>
export type CalibreRootSnapshotOut = SnapshotOut<typeof CalibreRootStore>
export type CalibreRootSnapshotIn = SnapshotIn<typeof CalibreRootStore>

function convertSearchResult(data: ApiBookInfoCore, selectedLibrary: LibraryMap) {
  selectedLibrary.searchSetting = SearchSettingModel.create({
    offset: data.search_result.num + data.search_result.offset,
    query: data.search_result.query ? data.search_result.query : "",
    sort: data.search_result.sort,
    sortOrder: data.search_result.sort_order,
    totalNum: data.search_result.total_num
      ? data.search_result.total_num
      : selectedLibrary.searchSetting.totalNum,
  })
  data.search_result.book_ids.forEach((bookId: number) => {
    const metadata = data.metadata[bookId]

    const metaDataModel = MetadataModel.create({
      authors: metadata.authors,
      authorSort: metadata.author_sort,
      formats: metadata.formats,
      lastModified: metadata.last_modified,
      seriesIndex: metadata.series_index,
      sharpFixed: metadata["#fixed"],
      size: metadata.size,
      sort: metadata.sort,
      tags: metadata.tags,
      timestamp: metadata.timestamp,
      title: metadata.title,
      uuid: metadata.uuid,
      rating: metadata.rating,
      languages: metadata.languages,
      langNames: metadata.lang_names,
      formatSizes: metadata.format_sizes,
    })

    selectedLibrary.books.set(bookId.toString(), {
      id: bookId,
      metaData: metaDataModel as unknown,
    })
  })

  if (data.sortable_fields) {
    selectedLibrary.sortField.clear()
    data.sortable_fields.forEach((value) => {
      const sortField = SortFieldModel.create({
        id: value[0],
        name: value[1],
      })

      selectedLibrary.sortField.push(sortField)
    })
  }
}

function convertLibraryInformation(bookInfo: ApiBookInfo, libraryInfo: LibraryMap) {
  libraryInfo.bookDisplayFields.clear()
  libraryInfo.fieldMetadataList.clear()
  bookInfo.book_display_fields.forEach((value) => {
    libraryInfo.bookDisplayFields.push(value)
  })

  Object.keys(bookInfo.field_metadata).forEach((key) => {
    let display = undefined
    if (bookInfo.field_metadata[key].display.date_format) {
      display = DateFormatModel.create({
        dateFormat: bookInfo.field_metadata[key].display.date_format,
      })
    }
    let isMultiple
    if (bookInfo.field_metadata[key].is_multiple.cache_to_list) {
      isMultiple = IsMultipleModel.create({
        cacheToList: bookInfo.field_metadata[key].is_multiple.cache_to_list,
        listToUi: bookInfo.field_metadata[key].is_multiple.list_to_ui,
        uiToList: bookInfo.field_metadata[key].is_multiple.ui_to_list,
      })
    }
    const fieldMetadata = FieldMetadataModel.create({
      categorySort: bookInfo.field_metadata[key].category_sort,
      column: bookInfo.field_metadata[key].column,
      datatype: bookInfo.field_metadata[key].datatype,
      display: display,
      isMultiple: isMultiple,
      isCategory: bookInfo.field_metadata[key].is_category,
      isCsp: bookInfo.field_metadata[key].is_csp,
      isCustom: bookInfo.field_metadata[key].is_custom,
      isEditable: bookInfo.field_metadata[key].is_editable,
      kind: bookInfo.field_metadata[key].kind,
      label: lowerCaseToCamelCase(bookInfo.field_metadata[key].label),
      linkColumn: bookInfo.field_metadata[key].link_column,
      name: bookInfo.field_metadata[key].name,
      recIndex: bookInfo.field_metadata[key].rec_index,
      searchTerms: bookInfo.field_metadata[key].search_terms,
      table: bookInfo.field_metadata[key].table,
    })
    libraryInfo.fieldMetadataList.set(lowerCaseToCamelCase(key), fieldMetadata)
  })
}
