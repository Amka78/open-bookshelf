import { types } from "mobx-state-tree"
export const CategoryModel = types.model("CategoryModel").props({
  label: types.string,
  schema: types.string,
  term: types.string,
})
