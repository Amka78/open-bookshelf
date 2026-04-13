import { type Instance, type SnapshotIn, type SnapshotOut, flow, types } from "mobx-state-tree"

import { lowerCaseToCamelCase } from "@/utils/convert"
import {
  type ApiBookInfo,
  type ApiBookInfoCore,
  type ApiCalibreInterfaceType,
  type FieldMetadata,
  api,
} from "../services/api"
import {
  CategoryModel,
  DateFormatModel,
  FieldMetadataModel,
  IsMultipleModel,
  type LibraryMap,
  LibraryMapModel,
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
    readingHistories: types.array(ReadingHistoryModel),
    isFetchingMore: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    initialize: flow(function* () {
      const response = yield api.initializeCalibre()
      if (response.kind === "ok") {
        const data: ApiCalibreInterfaceType = response.data
        root.defaultLibraryId = data.default_library_id
        root.numPerPage = data.num_per_page

        root.libraryMap.clear()
        Object.keys(data.library_map).forEach((keyName: string) => {
          root.libraryMap.set(keyName, { id: keyName })
        })

        data.recently_read_by_user?.forEach((readingInfo) => {
          const posFrac = typeof readingInfo.pos_frac === "number" ? readingInfo.pos_frac : null
          const epoch = typeof readingInfo.epoch === "number" ? readingInfo.epoch : null

          let readingHistory = root.readingHistories.find((h) => {
            return (
              h.libraryId === readingInfo.library_id &&
              h.bookId === readingInfo.book_id &&
              h.format === readingInfo.format
            )
          })
          if (readingHistory) {
            // Update server-side position if the server epoch is newer than what we have.
            if (
              posFrac !== null &&
              epoch !== null &&
              (readingHistory.serverEpoch === null ||
                readingHistory.serverEpoch === undefined ||
                epoch > readingHistory.serverEpoch)
            ) {
              readingHistory.setServerPosition(posFrac, epoch)
            }
          } else {
            readingHistory = ReadingHistoryModel.create({
              bookId: readingInfo.book_id,
              currentPage: 0,
              libraryId: readingInfo.library_id,
              format: readingInfo.format,
              serverPosFrac: posFrac,
              serverEpoch: epoch,
            })
            root.readingHistories.push(readingHistory)
          }
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
          (value: { id: string; children: { id: string; children: { id: string }[] }[] }) => {
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

            const subCategoryArray: Instance<typeof SubCategoryModel>[] = []
            Object.values(value.children).forEach((subValue) => {
              const subCateogy = response.data.item_map[subValue.id]
              const subCategoryModel = SubCategoryModel.create({
                category: subCateogy.category,
                count: subCateogy.count,
                isCategory: subCateogy.is_category,
                isSearchable: subCateogy.is_searchable,
                name: subCateogy.name,
              })

              const nodeArray: Instance<typeof NodeModel>[] = []
              Object.values(subValue.children).forEach((nodeValue: { id: string }) => {
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
    searchLibrary: flow(function* (num?: number) {
      root.isFetchingMore = false
      const response = yield api.getLibrary(
        root.selectedLibrary.id,
        root.selectedLibrary.searchSetting ? root.selectedLibrary.searchSetting.query : "",
        root.selectedLibrary.searchSetting ? root.selectedLibrary.searchSetting.sort : "timestamp",
        root.selectedLibrary.searchSetting ? root.selectedLibrary.searchSetting.sortOrder : "desc",
        root.selectedLibrary.searchSetting?.vl,
        num,
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
      if (!selectedLibrary) return false

      // Guard: prevent duplicate calls or fetching when already at end
      if (root.isFetchingMore) return false
      const totalNum = selectedLibrary.searchSetting?.totalNum ?? 0
      const offset = selectedLibrary.searchSetting?.offset ?? 0
      if (totalNum > 0 && offset >= totalNum) return false

      root.isFetchingMore = true
      try {
        const response = yield api.getMoreLibrary(selectedLibrary.id, {
          offset: offset,
          query: selectedLibrary.searchSetting.query ? selectedLibrary.searchSetting.query : "",
          sort: selectedLibrary.searchSetting.sort,
          sort_order: selectedLibrary.searchSetting.sortOrder,
          vl: selectedLibrary.searchSetting.vl ?? "",
        })

        if (response.kind === "ok") {
          convertSearchResult(response.data, selectedLibrary)
          return true
        }
        handleCommonApiError(response)
        return false
      } finally {
        root.isFetchingMore = false
      }
    }),
    setLibrary: (libraryId?: string) => {
      // MST resolves references by identifier at runtime; TS types don't allow direct ID assignment
      root.selectedLibrary = libraryId as unknown as typeof root.selectedLibrary
    },
    addReadingHistory: (model: ReadingHistory) => {
      root.readingHistories.push(model)
    },
    removeReadingHistoriesByBook: (libraryId: string, bookId: number) => {
      const remainedHistories = root.readingHistories.filter((history) => {
        return !(history.libraryId === libraryId && history.bookId === bookId)
      })
      root.readingHistories.replace(remainedHistories)
    },
  }))

export type CalibreRoot = Instance<typeof CalibreRootStore>
export type CalibreRootSnapshotOut = SnapshotOut<typeof CalibreRootStore>
export type CalibreRootSnapshotIn = SnapshotIn<typeof CalibreRootStore>

function convertSearchResult(data: ApiBookInfoCore, selectedLibrary: LibraryMap) {
  const previousQuery = selectedLibrary.searchSetting?.query ?? ""

  selectedLibrary.searchSetting = SearchSettingModel.create({
    offset: data.search_result.num + data.search_result.offset,
    query: data.search_result.query ? data.search_result.query : previousQuery,
    sort: data.search_result.sort,
    sortOrder: data.search_result.sort_order,
    totalNum: data.search_result.total_num
      ? data.search_result.total_num
      : selectedLibrary.searchSetting.totalNum,
    vl: selectedLibrary.searchSetting?.vl ?? null,
  })
  data.search_result.book_ids.forEach((bookId: number) => {
    const metadata = data.metadata[bookId]

    const metaDataModel = MetadataModel.create({
      authors: metadata.authors,
      authorSort: metadata.author_sort,
      formats: metadata.formats,
      lastModified: metadata.last_modified,
      series: metadata.series ?? null,
      seriesIndex: metadata.series_index,
      sharpFixed: (metadata as Record<string, unknown>)["#fixed"] as boolean | null,
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
      publisher: metadata.publisher ?? null,
      pubdate: metadata.pubdate ?? null,
      comments: metadata.comments ?? null,
      identifiers: metadata.identifiers ?? {},
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
  libraryInfo.virtualLibraries.clear()
  libraryInfo.setProp("ftsEnabled", bookInfo.fts_enabled ?? false)

  Object.keys(bookInfo.virtual_libraries).forEach((key) => {
    libraryInfo.virtualLibraries.push({ name: key, path: bookInfo.virtual_libraries[key] })
  })

  bookInfo.book_display_fields.forEach((value) => {
    libraryInfo.bookDisplayFields.push(value)
  })

  const fieldMetadataRecord = bookInfo.field_metadata as unknown as Record<string, FieldMetadata>
  Object.keys(fieldMetadataRecord).forEach((key) => {
    const fm = fieldMetadataRecord[key]
    let display = undefined
    if (fm.display !== undefined && fm.display.date_format) {
      display = DateFormatModel.create({
        dateFormat: fm.display.date_format,
      })
    }
    let isMultiple = undefined
    if (fm.is_multiple !== undefined && fm.is_multiple.cache_to_list) {
      isMultiple = IsMultipleModel.create({
        cacheToList: fm.is_multiple.cache_to_list as string,
        listToUi: fm.is_multiple.list_to_ui as string | null,
        uiToList: fm.is_multiple.ui_to_list as string | null,
      })
    }
    const fieldMetadata = FieldMetadataModel.create({
      categorySort: fm.category_sort,
      column: fm.column,
      datatype: fm.datatype,
      display: display,
      isMultiple: isMultiple,
      isCategory: fm.is_category,
      isCsp: fm.is_csp,
      isCustom: fm.is_custom,
      isEditable: fm.is_editable,
      kind: fm.kind,
      label: lowerCaseToCamelCase(fm.label),
      linkColumn: fm.link_column,
      name: fm.name,
      recIndex: fm.rec_index,
      searchTerms: fm.search_terms,
      table: fm.table,
    })
    libraryInfo.fieldMetadataList.set(lowerCaseToCamelCase(key), fieldMetadata)
  })
}

export type { LibraryMap }
