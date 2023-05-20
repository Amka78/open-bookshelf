import { id } from "date-fns/locale"
import { flow, getParent, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

import { api } from "../services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"

const FormatSizeModel = types.model("FormatSizeModel").props({
  id: types.identifier,
  size: types.maybeNull(types.number),
})

export const MetadataModel = types.model("MetadataModel").props({
  sharpFixed: types.maybeNull(types.boolean),
  authorSort: types.maybeNull(types.string),
  authors: types.array(types.string),
  //formatSizes: types.map(FormatSizeModel),
  formats: types.array(types.string),
  lastModified: types.maybeNull(types.string),
  seriesIndex: types.maybeNull(types.number),
  size: types.maybeNull(types.number),
  sort: types.maybeNull(types.string),
  tags: types.array(types.string),
  timestamp: types.maybeNull(types.string),
  title: types.maybeNull(types.string),
  uuid: types.maybeNull(types.string),
})

export const LibraryModel = types
  .model("LibraryModel")
  .props({
    id: types.identifierNumber,
    metaData: types.maybeNull(MetadataModel),
    path: types.array(types.string),
    hash: types.maybeNull(types.number),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    convertBook: flow(function* () {
      const libraryMap = getParent(root) as LibraryMap
      const interval = setInterval(async () => {
        const response = await api.CheckBookConverting(
          libraryMap.id,
          root.id,
          root.metaData.formats[0],
        )

        if (response.kind !== "ok") {
          clearInterval(interval)
        } else {
          if (response.data.files !== undefined) {
            clearInterval(interval)

            console.log("convert start")
            const spineResponse = await api.getLibraryInformation(
              libraryMap.id,
              root.id,
              root.metaData.formats[0],
              root.metaData.size,
              response.data.book_hash.mtime,
              response.data.spine[0],
            )

            const pathList = []

            if (spineResponse.kind === "ok") {
              Object.values(spineResponse.data.tree.c[1].c).forEach((path: any) => {
                pathList.push(path.a[2][1])
              })
            }

            root.setProp("path", pathList)
            root.setProp("hash", response.data.book_hash.mtime)
          }
        }
      }, 600)
    }),
  }))
export interface Library extends Instance<typeof LibraryModel> {}
export interface LibrarySnapshotOut extends SnapshotOut<typeof LibraryModel> {}
export interface LibrarySnapshotIn extends SnapshotIn<typeof LibraryModel> {}

export const SearchSettingModel = types.model("SearchSettingModel").props({
  offset: types.maybeNull(types.number),
  query: types.maybeNull(types.string),
  sort: types.maybeNull(types.string),
  sortOrder: types.maybeNull(types.string),
  totalNum: types.maybeNull(types.number),
})

export const SortFieldModel = types.model("SortFieldModel").props({
  id: types.identifier,
  name: types.string,
})

export const LibraryMapModel = types.model("LibrayMapModel").props({
  id: types.identifier,
  value: types.array(LibraryModel),
  searchSetting: types.maybeNull(SearchSettingModel),
  sortField: types.array(SortFieldModel),
})

export interface LibraryMap extends Instance<typeof LibraryMapModel> {}
export interface LibraryMapSnapshotOut extends SnapshotOut<typeof LibraryMapModel> {}
export interface LibraryMapSnapshotIn extends SnapshotIn<typeof LibraryMapModel> {}

/**
 * Calibre Root Information
 */
export const CalibreRootStore = types
  .model("CalibreRootStore")
  .props({
    defaultLibraryId: types.maybeNull(types.string),
    numPerPage: types.maybeNull(types.number),
    libraryMap: types.array(LibraryMapModel),
    selectedLibraryId: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    initialize: flow(function* () {
      const response = yield api.initializeCalibre()
      if (response.kind === "ok") {
        root.defaultLibraryId = response.data.default_library_id
        root.numPerPage = response.data.num_per_page

        root.libraryMap.clear()
        Object.keys(response.data.library_map).forEach((value: string) => {
          root.libraryMap.push({ id: value })
        })
      }
    }),
    searchtLibrary: flow(function* (searchText: string) {
      const response = yield api.getLibrary(root.selectedLibraryId, searchText)

      if (response.kind === "ok") {
        const selectedLibrary = root.libraryMap.find((value) => {
          return value.id === root.selectedLibraryId
        })
        selectedLibrary.value.clear()
        setSearchResult(response, selectedLibrary)
      }
    }),
    searchMoreLibrary: flow(function* () {
      const selectedLibrary = getSelectedLibrary(root)
      const response = yield api.getMoreLibrary(root.selectedLibraryId, {
        offset: selectedLibrary.searchSetting.offset,
        query: selectedLibrary.searchSetting.query ? selectedLibrary.searchSetting.query : "",
        sort: selectedLibrary.searchSetting.sort,
        sort_order: selectedLibrary.searchSetting.sortOrder,
        vl: "",
      })

      if (response.kind === "ok") {
        console.log(response.data)
        setSearchResult(response, selectedLibrary)
      }
    }),
    setSelectedLibraryId: (libraryId: string) => {
      root.selectedLibraryId = libraryId
    },
    getSelectedLibrary: () => {
      return root.libraryMap.find((value) => {
        return value.id === root.selectedLibraryId
      })
    },
  }))

export interface CalibreRoot extends Instance<typeof CalibreRootStore> {}
export interface CalibreRootSnapshotOut extends SnapshotOut<typeof CalibreRootStore> {}
export interface CalibreRootSnapshotIn extends SnapshotIn<typeof CalibreRootStore> {}
function getSelectedLibrary(root): LibraryMap {
  return root.libraryMap.find((value) => {
    return value.id === root.selectedLibraryId
  })
}

function setSearchResult(response: any, selectedLibrary: LibraryMap) {
  selectedLibrary.searchSetting = SearchSettingModel.create({
    offset: response.data.search_result.num + response.data.search_result.offset,
    query: response.data.search_result.query ? response.data.search_result.query : "",
    sort: response.data.search_result.sort,
    sortOrder: response.data.search_result.sort_order,
    totalNum: response.data.search_result.total_num
      ? response.data.search_result.total_num
      : selectedLibrary.searchSetting.totalNum,
  })
  response.data.search_result.book_ids.forEach((key: number) => {
    const metaData = response.data.metadata[key]

    const metaDataModel = MetadataModel.create({
      authors: metaData.authors,
      authorSort: metaData.author_sort,
      formats: metaData.formats,
      lastModified: metaData.last_modified,
      seriesIndex: metaData.series_index,
      sharpFixed: metaData["#fixed"],
      size: metaData.size,
      sort: metaData.sort,
      tags: metaData.tags,
      timestamp: metaData.timestamp,
      title: metaData.title,
      uuid: metaData.uuid,
    })

    selectedLibrary.value.push({
      id: key,
      metaData: metaDataModel,
    })
  })
}
