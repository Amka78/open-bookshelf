import { type Instance, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

export const VirtualLibraryModel = types
  .model("VirtualLibraryModel")
  .props({
    name: types.string,
    path: types.string,
  })
  .actions(withSetPropAction)
export type VirtualLibrary = Instance<typeof VirtualLibraryModel>
