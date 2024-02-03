import { Instance, types } from "mobx-state-tree"

export const SortFieldModel = types.model("SortFieldModel").props({
  id: types.identifier,
  name: types.string,
})
export type SortField = Instance<typeof SortFieldModel>
