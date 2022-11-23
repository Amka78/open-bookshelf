import { types } from "mobx-state-tree"

export const CopiesModel = types.model("CopiesModel").props({
  total: types.number,
  available: types.number,
})
