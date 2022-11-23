import { types } from "mobx-state-tree"

export const HoldsModel = types.model("HoldsModel").props({
  total: types.number,
  position: types.number,
})
