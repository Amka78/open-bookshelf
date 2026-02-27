import { types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
export const SearchSettingModel = types
  .model("SearchSettingModel")
  .props({
    offset: types.maybeNull(types.number),
    query: types.maybeNull(types.string),
    sort: types.maybeNull(types.string),
    sortOrder: types.maybeNull(types.string),
    totalNum: types.maybeNull(types.number),
    vl: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
