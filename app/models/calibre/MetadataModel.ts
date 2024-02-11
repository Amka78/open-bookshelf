import { Instance, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

export const MetadataModel = types
  .model("MetadataModel")
  .props({
    sharpFixed: types.maybeNull(types.boolean),
    authorSort: types.maybeNull(types.string),
    authors: types.array(types.string),
    formats: types.array(types.string),
    lastModified: types.maybeNull(types.string),
    seriesIndex: types.maybeNull(types.number),
    size: types.maybeNull(types.number),
    sort: types.maybeNull(types.string),
    tags: types.array(types.string),
    timestamp: types.maybeNull(types.string),
    title: types.maybeNull(types.string),
    uuid: types.maybeNull(types.string),
    selectedFormat: types.maybeNull(types.string),
    rating: types.maybeNull(types.number),
  })
  .actions(withSetPropAction)
