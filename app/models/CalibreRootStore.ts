import { flow, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"

import { api } from "../services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * Calibre Root Information
 */
export const CalibreRootStore = types
  .model("CalibreRootStore")
  .props({
    defaultLibraryId: types.maybeNull(types.string),
    numPerPage: types.maybeNull(types.number),
    libraryMap: types.array(types.string),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    initialize: flow(function* () {
      const response = yield api.initializeCalibre()
      console.log(response)
      if (response.kind === "ok") {
        root.defaultLibraryId = response.data.default_library_id
        root.numPerPage = response.data.num_per_page

        Object.keys(response.data.library_map).forEach((value: string) => {
          root.libraryMap.push(value)
        })
      }
    }),
  }))

export interface CalibreRoot extends Instance<typeof CalibreRootStore> {}
export interface CalibreRootSnapshotOut extends SnapshotOut<typeof CalibreRootStore> {}
export interface CalibreRootSnapshotIn extends SnapshotIn<typeof CalibreRootStore> {}
