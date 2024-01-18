import { Instance, types } from "mobx-state-tree"

export const AuthorModel = types.model("AuthorModel").props({
  name: types.maybeNull(types.string),
  uri: types.maybeNull(types.string),
  email: types.maybeNull(types.string),
})
export type Author = Instance<typeof AuthorModel>
