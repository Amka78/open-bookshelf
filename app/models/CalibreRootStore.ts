import { flow, getParent, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

import { api, ApiBookManifestType } from "../services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { ConvertApiErrorToException } from "./exceptions/Exceptions"
import { ClientSettingModel } from "./calibre"
import { GeneralApiProblem } from "@/services/api/apiProblem"

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
    pageProgressionDirection: types.maybeNull(
      types.union(types.literal("rtl"), types.literal("ltr")),
    ),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    convertBook: flow(function* (format: string, onPostConvert: () => void) {
      const libraryMap = getParent(root) as any

      let response: { kind: "ok"; data: ApiBookManifestType } | GeneralApiProblem
      while (response?.data?.files === undefined) {
        response = yield api.CheckBookConverting(libraryMap.id, root.id, format)

        if (response.kind !== "ok") {
          if (response.kind === "not-found") {
            throw new Error(response.message)
          }
          throw new Error()
        } else {
          if (response.data.job_status === "finished") {
            if (response.data.traceback) {
              throw new Error(response.data.traceback)
            }
          }
        }

        yield delay(6000)
      }

      const pathList = []

      if (response.data.book_format !== "KF8") {
        const spineResponse = yield api.getLibraryInformation(
          libraryMap.id,
          root.id,
          response.data.book_format,
          root.metaData.size,
          response.data.book_hash.mtime,
          response.data.spine[0],
        )

        if (spineResponse.kind === "ok") {
          Object.values(spineResponse.data.tree.c[1].c).forEach((path: any) => {
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
        Object.values(response.data.spine).forEach((value) => {
          pathList.push(value)
        })
      }

      root.setProp("path", pathList)
      root.setProp("hash", response.data.book_hash.mtime)

      if (response.data.page_progression_direction) {
        root.setProp("pageProgressionDirection", response.data.page_progression_direction)
      }
      onPostConvert()
    }),
  }))
export interface Library extends Instance<typeof LibraryModel> {}
export interface LibrarySnapshotOut extends SnapshotOut<typeof LibraryModel> {}
export interface LibrarySnapshotIn extends SnapshotIn<typeof LibraryModel> {}

export const SearchSettingModel = types
  .model("SearchSettingModel")
  .props({
    offset: types.maybeNull(types.number),
    query: types.maybeNull(types.string),
    sort: types.maybeNull(types.string),
    sortOrder: types.maybeNull(types.string),
    totalNum: types.maybeNull(types.number),
  })
  .actions(withSetPropAction)

export const SortFieldModel = types.model("SortFieldModel").props({
  id: types.identifier,
  name: types.string,
})
export interface SortField extends Instance<typeof SortFieldModel> {}

export const NodeModel = types.model("NodeModel").props({
  id: types.number,
  avgRating: types.number,
  count: types.number,
  name: types.string,
})

export const CategoryTemplateModel = types.model("CategoryTemplateModel").props({
  category: types.string,
  name: types.string,
  isCategory: types.maybe(types.boolean),
  count: types.number,
  isSearchable: types.maybe(types.boolean),
})

export const SubCategoryModel = types
  .compose(
    "SubCategoryModel",
    types.model({
      children: types.array(NodeModel),
    }),
    CategoryTemplateModel,
  )
  .actions(withSetPropAction)

export const CategoryModel = types
  .compose(
    "CategoryModel",
    types.model({
      tooltip: types.maybe(types.string),
      isEditable: types.boolean,
      subCategory: types.array(SubCategoryModel),
    }),
    CategoryTemplateModel,
  )
  .actions(withSetPropAction)
export interface Category extends Instance<typeof CategoryModel> {}

export const LibraryMapModel = types
  .model("LibrayMapModel")
  .props({
    id: types.identifier,
    value: types.array(LibraryModel),
    searchSetting: types.maybeNull(SearchSettingModel),
    sortField: types.array(SortFieldModel),
    tagBrowser: types.array(CategoryModel),
    clientSetting: types.array(ClientSettingModel),
  })
  .actions(withSetPropAction)

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
      console.log(response)
      if (response.kind === "ok") {
        root.defaultLibraryId = response.data.default_library_id
        root.numPerPage = response.data.num_per_page

        root.libraryMap.clear()
        Object.keys(response.data.library_map).forEach((value: string) => {
          root.libraryMap.push({ id: value })
        })
      } else {
        throw ConvertApiErrorToException(response)
      }
    }),
    getTagBrowser: flow(function* () {
      const response = yield api.getTagBrowser(root.defaultLibraryId)
      if (response.kind === "ok") {
        const selectedLibrary = root.libraryMap.find((value) => {
          return value.id === root.selectedLibraryId
        })

        selectedLibrary.tagBrowser.clear()

        Object.values(response.data.root.children).forEach((value: any) => {
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
          Object.values(value.children).forEach((subValue: any) => {
            const subCateogy = response.data.item_map[subValue.id]
            const subCategoryModel = SubCategoryModel.create({
              category: subCateogy.category,
              count: subCateogy.count,
              isCategory: subCateogy.is_category,
              isSearchable: subCateogy.is_searchable,
              name: subCateogy.name,
            })

            const nodeArray = []
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

          selectedLibrary.tagBrowser.push(categoryModel)
        })
      }
    }),
    searchLibrary: flow(function* () {
      const selectedLibrary = root.libraryMap.find((value) => {
        return value.id === root.selectedLibraryId
      })
      const response = yield api.getLibrary(
        root.selectedLibraryId,
        selectedLibrary.searchSetting ? selectedLibrary.searchSetting.query : "",
        selectedLibrary.searchSetting ? selectedLibrary.searchSetting.sort : "timestamp",
        selectedLibrary.searchSetting ? selectedLibrary.searchSetting.sortOrder : "desc",
      )

      if (response.kind === "ok") {
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

  if (response.data.sortable_fields) {
    selectedLibrary.sortField.clear()
    response.data.sortable_fields.forEach((value) => {
      const sortField = SortFieldModel.create({
        id: value[0],
        name: value[1],
      })

      selectedLibrary.sortField.push(sortField)
    })
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
