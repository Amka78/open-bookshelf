import { Instance, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

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
export type Category = Instance<typeof CategoryModel>
