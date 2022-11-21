import { Instance, types } from "mobx-state-tree"
import { Author as AuthorXml } from "r2-opds-js/dist/es8-es2017/src/opds/opds1/opds-author"

export const AuthorModel = types.model("AuthorModel").props({
  name: types.string,
  uri: types.string,
  email: types.string,
})
export interface Author extends Instance<typeof AuthorModel> {}

export function convertFromXml(fromAuthors: AuthorXml[], toAuthors: Author[]) {
  fromAuthors.forEach((author) => {
    const model = AuthorModel.create()
    model.name = author.Name
    model.uri = author.Uri
    model.email = author.Email
    toAuthors.push(model)
  })
}
