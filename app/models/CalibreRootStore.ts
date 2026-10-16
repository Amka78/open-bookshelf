import { detach, type Instance, type SnapshotIn, type SnapshotOut, flow, types } from "mobx-state-tree"

import { lowerCaseToCamelCase } from "@/utils/convert"
import {
  type ApiBookInfo,
  type ApiBookInfoCore,
  type ApiCalibreInterfaceType,
  type FieldMetadata,
  type MetadataType,
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
  ConversionJobModel,
  type ReadingHistory,
  ReadingHistoryModel,
  SearchSettingModel,
  SortFieldModel,
  SubCategoryModel,
  VirtualLibraryModel,
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
    conversionJobs: types.optional(types.array(ConversionJobModel), []),
    thumbnailRevisions: types.optional(types.map(types.number), {}),
    isFetchingMore: types.optional(types.boolean, false),
  })
  .views((root) => ({
    getBookThumbnailRevision(libraryId: string, bookId: number) {
      return root.thumbnailRevisions.get(`${libraryId}:${bookId}`) ?? 0
    },
    getConversionJobsForLibrary(libraryId: string) {
      return root.conversionJobs.filter((job) => job.libraryId === libraryId)
    },
  }))
  .actions(withSetPropAction)
  .actions((root) => ({
    initialize: flow(function* () {
      const response = yield api.initializeCalibre()
      if (response.kind === "ok") {
        const data: ApiCalibreInterfaceType = response.data
        root.defaultLibraryId = data.default_library_id ?? null
        root.numPerPage = data.num_per_page ?? null

        // selectedLibraryをクリアしてからlibraryMapをクリアする。
        // libraryMap.clear()で参照先が削除されると、selectedLibraryが無効な参照を保持し、
        // その後にselectedLibraryにアクセスすると「no longer part of a state tree」エラーが発生する。
        root.selectedLibrary = undefined
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
      const response = yield api.getTagBrowser(root.defaultLibraryId ?? "")
      if (response.kind === "ok") {
        const oldTbSnapshot = [...root.selectedLibrary!.tagBrowser]
        for (const cat of oldTbSnapshot) {
          detach(cat)
        }
        root.selectedLibrary!.tagBrowser.clear()

        const rootChildren = Object.values((response.data as any).root.children) as any[]
        rootChildren.forEach(
          (value: any) => {
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
            Object.values(value.children).forEach((subValue: any) => {
              const subCateogy = response.data.item_map[subValue.id]
              const subCategoryModel = SubCategoryModel.create({
                category: subCateogy.category,
                count: subCateogy.count,
                isCategory: subCateogy.is_category,
                isSearchable: subCateogy.is_searchable,
                name: subCateogy.name,
              })

              const nodeArray: Instance<typeof NodeModel>[] = []
              Object.values(subValue.children).forEach((nodeValue: any) => {
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
            root.selectedLibrary!.tagBrowser.push(categoryModel)
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
        root.selectedLibrary!.id,
        root.selectedLibrary!.searchSetting ? root.selectedLibrary!.searchSetting.query ?? "" : "",
        root.selectedLibrary!.searchSetting ? (root.selectedLibrary!.searchSetting.sort ?? "timestamp") : "timestamp",
        root.selectedLibrary!.searchSetting ? (root.selectedLibrary!.searchSetting.sortOrder ?? "desc") : "desc",
        root.selectedLibrary!.searchSetting?.vl,
        num,
      )

      if (response.kind === "ok") {
        // books.clear() は使わない。convertSearchResult 内で古い books を個別に削除する。
        // React 19 の concurrent mode では、clear() による一括削除が中間 render を引き起こし、
        // 削除済みノードへの参照エラーが発生するため。
        convertLibraryInformation(response.data, root.selectedLibrary!)
        convertSearchResult(response.data, root.selectedLibrary!)

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
          query: selectedLibrary.searchSetting!.query ? selectedLibrary.searchSetting!.query : "",
          sort: selectedLibrary.searchSetting!.sort,
          sort_order: selectedLibrary.searchSetting!.sortOrder,
          vl: selectedLibrary.searchSetting!.vl ?? "",
        })

        if (response.kind === "ok") {
          convertSearchResult(response.data, selectedLibrary, true)
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
    addConversionJob: (params: {
      jobId: number
      libraryId: string
      bookId: number
      bookTitle: string
      inputFormat: string
      outputFormat: string
    }) => {
      const id = `${params.libraryId}:${params.jobId}`
      const existingJob = root.conversionJobs.find((job) => job.id === id)

      if (existingJob) {
        existingJob.setProp("bookId", params.bookId)
        existingJob.setProp("bookTitle", params.bookTitle)
        existingJob.setProp("inputFormat", params.inputFormat)
        existingJob.setProp("outputFormat", params.outputFormat)
        existingJob.setProp("status", "running")
        existingJob.setProp("percent", 0)
        existingJob.setProp("message", null)
        existingJob.setProp("log", null)
        existingJob.setProp("traceback", null)
        existingJob.setProp("size", null)
        existingJob.setProp("format", null)
        existingJob.setProp("updatedAt", Date.now())
        return
      }

      const now = Date.now()
      root.conversionJobs.push({
        id,
        jobId: params.jobId,
        libraryId: params.libraryId,
        bookId: params.bookId,
        bookTitle: params.bookTitle,
        inputFormat: params.inputFormat,
        outputFormat: params.outputFormat,
        status: "running",
        percent: 0,
        message: null,
        log: null,
        traceback: null,
        size: null,
        format: null,
        createdAt: now,
        updatedAt: now,
      })
    },
    updateConversionJobRunning: (
      libraryId: string,
      jobId: number,
      percent: number,
      message: string | null = null,
    ) => {
      const job = root.conversionJobs.find((item) => item.id === `${libraryId}:${jobId}`)
      if (!job) return
      job.markRunning(percent, message)
    },
    updateConversionJobFinished: (params: {
      libraryId: string
      jobId: number
      ok: boolean
      wasAborted: boolean
      traceback: string | null
      log: string | null
      size?: number | null
      format?: string | null
    }) => {
      const job = root.conversionJobs.find((item) => item.id === `${params.libraryId}:${params.jobId}`)
      if (!job) return

      if (params.ok) {
        job.markDone(params.format ?? null, params.size ?? null)
        return
      }

      if (params.wasAborted) {
        job.markAborted(params.traceback, params.log)
        return
      }

      job.markFailed(params.traceback, params.log)
    },
    removeConversionJob: (libraryId: string, jobId: number) => {
      const index = root.conversionJobs.findIndex((job) => job.id === `${libraryId}:${jobId}`)
      if (index >= 0) {
        root.conversionJobs.splice(index, 1)
      }
    },
    removeReadingHistoriesByBook: (libraryId: string, bookId: number) => {
      const remainedHistories = root.readingHistories.filter((history) => {
        return !(history.libraryId === libraryId && history.bookId === bookId)
      })
      root.readingHistories.replace(remainedHistories)
    },
    bumpBookThumbnailRevision: (libraryId: string, bookId: number) => {
      const revisionKey = `${libraryId}:${bookId}`
      const currentRevision = root.thumbnailRevisions.get(revisionKey) ?? 0
      root.thumbnailRevisions.set(revisionKey, currentRevision + 1)
    },
  }))

export type CalibreRoot = Instance<typeof CalibreRootStore>
export type CalibreRootSnapshotOut = SnapshotOut<typeof CalibreRootStore>
export type CalibreRootSnapshotIn = SnapshotIn<typeof CalibreRootStore>

function convertSearchResult(data: ApiBookInfoCore, selectedLibrary: LibraryMap, isAppend: boolean = false) {
  const previousQuery = selectedLibrary.searchSetting?.query ?? ""

  // searchSetting: detach してから置換（HMR reaction が古いノードを参照するのを防ぐ）
  const oldSearchSetting = selectedLibrary.searchSetting
  if (oldSearchSetting) detach(oldSearchSetting)

  selectedLibrary.searchSetting = SearchSettingModel.create({
    offset: data.search_result.num + data.search_result.offset,
    query: data.search_result.query ? data.search_result.query : previousQuery,
    sort: data.search_result.sort,
    sortOrder: data.search_result.sort_order,
    totalNum: data.search_result.total_num
      ? data.search_result.total_num
      : selectedLibrary.searchSetting!.totalNum,
    vl: selectedLibrary.searchSetting?.vl ?? null,
  })

  // 追加モードでない場合のみ、古い書籍を削除する
  if (!isAppend) {
    // React 19 の concurrent mode では、books.clear() の後に React の再 render が実行され、
    // 削除された BookModel の参照にアクセスしてエラーになる。
    // books.clear() を使わず、新しい book_ids に含まれない古い books を個別に削除する。
    const newBookIds = new Set(data.search_result.book_ids.map((id: number) => id.toString()))
    const existingKeys = Array.from(selectedLibrary.books.keys())
    for (const key of existingKeys) {
      if (!newBookIds.has(key)) {
        // detach でノードを生存させたままツリーから切り離す（HMR reaction 対策）
        const node = selectedLibrary.books.get(key)
        if (node) detach(node)
        selectedLibrary.books.delete(key)
      }
    }
  }

  data.search_result.book_ids.forEach((bookId: number) => {
    const metadata = (data.metadata as unknown as Record<string, MetadataType>)[bookId]

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
      customColumns: Object.fromEntries(
        Object.keys(metadata)
          .filter((key) => key.startsWith("#") && key !== "#fixed")
          .map((key) => [lowerCaseToCamelCase(key), metadata[key]]),
      ),
    })

    const bookKey = bookId.toString()
    // MST の map.set() は identifier が既存エントリと一致するとリコンサイル（同一ノードを返す）し、
    // MobX の reportChanged() が発火しない。detach → delete → set で新規ノード作成を強制する。
    if (selectedLibrary.books.has(bookKey)) {
      const existing = selectedLibrary.books.get(bookKey)
      if (existing) detach(existing)
      selectedLibrary.books.delete(bookKey)
    }
    selectedLibrary.books.set(bookKey, {
      id: bookId,
      metaData: metaDataModel as any,
    })
  })

  if (data.sortable_fields) {
    // sortField: detach してから replace
    const newSortFields = data.sortable_fields.map((value) =>
      SortFieldModel.create({
        id: value[0],
        name: value[1],
      }),
    )
    const oldSfSnapshot = [...selectedLibrary.sortField]
    for (const sf of oldSfSnapshot) {
      detach(sf)
    }
    selectedLibrary.sortField.replace(newSortFields)
  }
}

function convertLibraryInformation(bookInfo: ApiBookInfo, libraryInfo: LibraryMap) {
  // React 19 の concurrent mode では、clear() の後に React の再 render が実行され、
  // 削除されたノードの参照にアクセスしてエラーになる。
  // array は replace() でアトミックに置き換え、map は個別に delete してから set する。
  libraryInfo.setProp("ftsEnabled", bookInfo.fts_enabled ?? false)

  // virtualLibraries: 内容が変わっていない場合は replace をスキップ（HMR reaction 対策）
  const vlKeys = Object.keys(bookInfo.virtual_libraries)
  const oldVl = libraryInfo.virtualLibraries
  const vlChanged =
    vlKeys.length !== oldVl.length ||
    vlKeys.some((key, i) => oldVl[i]?.name !== key || oldVl[i]?.path !== bookInfo.virtual_libraries[key])

  if (vlChanged) {
    const newVirtualLibraries = vlKeys.map((key) =>
      VirtualLibraryModel.create({
        name: key,
        path: bookInfo.virtual_libraries[key],
      }),
    )
    // for...of で MST array を反復中に detach すると配列が縮んで要素がスキップされるため、
    // 先にスナップショットを撮る
    const oldVlSnapshot = [...oldVl]
    for (const vl of oldVlSnapshot) {
      detach(vl)
    }
    libraryInfo.virtualLibraries.replace(newVirtualLibraries)
  }

  // bookDisplayFields: 内容が変わっていない場合は replace をスキップ
  const newBdf = bookInfo.book_display_fields
  const oldBdf = libraryInfo.bookDisplayFields
  const bdfChanged =
    newBdf.length !== oldBdf.length || newBdf.some((v, i) => oldBdf[i] !== v)
  if (bdfChanged) {
    libraryInfo.bookDisplayFields.replace(newBdf)
  }

  // fieldMetadataList: map なので個別に delete してから set
  const fieldMetadataRecord = bookInfo.field_metadata as unknown as Record<string, FieldMetadata>
  const newFieldKeys = new Set(
    Object.keys(fieldMetadataRecord).map((key) => lowerCaseToCamelCase(key)),
  )
  const existingFieldKeys = Array.from(libraryInfo.fieldMetadataList.keys())
  for (const key of existingFieldKeys) {
    if (!newFieldKeys.has(key)) {
      const node = libraryInfo.fieldMetadataList.get(key)
      if (node) detach(node)
      libraryInfo.fieldMetadataList.delete(key)
    }
  }

  Object.keys(fieldMetadataRecord).forEach((key) => {
    const fm = fieldMetadataRecord[key]
    let display = undefined
    if (fm.display?.date_format) {
      display = DateFormatModel.create({
        dateFormat: fm.display.date_format,
      })
    }
    let isMultiple = undefined
    if (fm.is_multiple?.cache_to_list) {
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
