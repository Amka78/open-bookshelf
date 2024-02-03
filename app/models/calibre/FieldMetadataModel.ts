import { Instance, types } from "mobx-state-tree"

export const DateFormatModel = types.model("DateFormatModel").props({
  dateFormat: types.string,
})

export const IsMultipleModel = types.model("IsMultipleModel").props({
  cacheToList: types.string,
  listToUi: types.maybeNull(types.string),
  uiToList: types.maybeNull(types.string),
})

export const FieldMetadataModel = types.model("FieldMetadataModel").props({
  categorySort: types.maybe(types.string),
  column: types.maybeNull(types.string),
  datatype: types.maybeNull(types.string),
  display: types.maybe(DateFormatModel),
  isCategory: types.boolean,
  isCsp: types.boolean,
  isCustom: types.boolean,
  isEditable: types.boolean,
  isMultiple: types.maybe(IsMultipleModel),
  kind: types.string,
  label: types.string,
  link_column: types.maybe(types.string),
  name: types.maybeNull(types.string),
  recIndex: types.maybe(types.number),
  searchTerms: types.array(types.string),
  table: types.maybeNull(types.string),
})

export type FieldMetadata = Instance<typeof FieldMetadataModel>
