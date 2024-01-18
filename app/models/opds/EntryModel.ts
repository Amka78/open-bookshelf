import { Instance, types } from "mobx-state-tree"

import { AuthorModel } from "./AuthorModel"
import { CategoryModel } from "./CategoryModel"
import { LinkModel } from "./LinkModel"

export const EntryModel = types.model("EntryModel").props({
  author: types.array(AuthorModel),
  bibFrameDistributionProviderName: types.maybeNull(types.string),
  categories: types.array(CategoryModel),
  title: types.maybeNull(types.string),
  titleType: types.maybeNull(types.string),
  subTitle: types.maybeNull(types.string),
  subTitleType: types.maybeNull(types.string),
  summary: types.maybeNull(types.string),
  summaryType: types.maybeNull(types.string),
  id: types.maybeNull(types.string),
  updated: types.maybeNull(types.Date),
  content: types.maybeNull(types.string),
  contentType: types.maybeNull(types.string),
  dcExtent: types.maybeNull(types.string),
  dcIdentifier: types.maybeNull(types.string),
  dcIdentifierType: types.maybeNull(types.string),
  dcLanguage: types.maybeNull(types.string),
  dcPublisher: types.maybeNull(types.string),
  dcRights: types.maybeNull(types.string),
  dcIssued: types.maybeNull(types.string),
  published: types.maybeNull(types.Date),
  link: types.array(LinkModel),
  schemaRatingValue: types.maybeNull(types.string),
  schemaRatingAdditionalType: types.maybeNull(types.string),
  schemaAdditionalType: types.maybeNull(types.string),
})
export type Entry = Instance<typeof EntryModel>
