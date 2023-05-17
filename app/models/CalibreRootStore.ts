import { flow, Instance, SnapshotIn, SnapshotOut, types, getParent } from "mobx-state-tree"

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
    id: types.identifier,
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

        console.log(response)
        if (response.kind !== "ok") {
          clearInterval(interval)
        } else {
          if (response.data.files !== undefined) {
            clearInterval(interval)

            let pathList = []
            Object.keys(response.data.files).forEach((value) => {
              console.log(value)

              if (response.data.spine[0] !== value) {
                pathList.push(value)
              }
            })

            if (root.metaData.formats[0] === "CBZ") {
              pathList = pathList.sort((a: string, b: string) => {
                const aNum = Number(a.split(" ")[0])
                const bNum = Number(b.split(" ")[0])

                return aNum - bNum
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

export const LibraryMapModel = types.model("LibrayMapModel").props({
  id: types.identifier,
  value: types.array(LibraryModel),
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
    initializeLibrary: flow(function* () {
      const response = yield api.initializeLibrary(root.selectedLibraryId)

      const responseMetadata = response.data.metadata
      console.log("get metadata")
      if (response.kind === "ok") {
        Object.keys(responseMetadata).forEach((key: string) => {
          const metaData = responseMetadata[key]

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
          const selectedLibrary = root.libraryMap.find((value) => {
            return value.id === root.selectedLibraryId
          })

          selectedLibrary.value.push({
            id: key,
            metaData: metaDataModel,
          })
        })
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
