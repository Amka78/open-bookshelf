import { BookModel, FieldMetadataModel } from "@/models/calibre"
import { types } from "mobx-state-tree"

const commonField = {
  isCategory: false,
  isCustom: false,
  isEditable: true,
  isCsp: false,
  kind: "test",
}

const lastModifiedTestField = FieldMetadataModel.create({
  name: "Last ModifiedXXXXX",
  datatype: "datetime",
  display: {
    dateFormat: "yyyy MM dd",
  },
  ...commonField,
  label: "lastModified",
})

const formatsTestField = FieldMetadataModel.create({
  name: "Formats",
  datatype: "text",
  isMultiple: {
    listToUi: ",",
    cacheToList: ",",
    uiToList: ",",
  },
  ...commonField,
  label: "formats",
})

const ratingTestField = FieldMetadataModel.create({
  name: "Rating",
  datatype: "rating",
  ...commonField,
  label: "rating",
})

const titleTestField = FieldMetadataModel.create({
  name: "Title",
  datatype: "text",
  ...commonField,
  label: "title",
})

const authorTestField = FieldMetadataModel.create({
  name: "Author",
  datatype: "text",
  ...commonField,
  isMultiple: {
    listToUi: "&",
    cacheToList: "&",
    uiToList: "&",
  },
  label: "authors",
})

const book = BookModel.create({
  id: 12345,
  metaData: {
    lastModified: "2023-12-18T18:25:04+00:00",
    formats: ["CBZ", "EPUB", "PDF"],
    rating: 8,
    title: "Book Title",
    size: 100000,
    authorSort: null,
    authors: ["bookAuthor 1", "bookAuthor 2"],
  },
})

const fieldNameList = [
  "lastModified",
  "formats",
  "rating",
  "title",
  "size",
  "authors",
  "authorSort",
]

const fieldMetadataList = types.map(FieldMetadataModel).create({
  lastModified: lastModifiedTestField,
  formats: formatsTestField,
  rating: ratingTestField,
  title: titleTestField,
  authors: authorTestField,
})

export const bookDetailFieldListStoryArgs = {
  fieldNameList,
  fieldMetadataList,
  book,
  borderColor: "$white",
  borderWidth: "$4" as const,
}

// --- Custom fields story data ---

const customCommonField = {
  isCategory: false,
  isCustom: true,
  isEditable: true,
  isCsp: false,
  kind: "field",
}

const bookWithCustomColumns = BookModel.create({
  id: 12346,
  metaData: {
    lastModified: "2023-12-18T18:25:04+00:00",
    formats: ["EPUB"],
    rating: 0,
    title: "Book With Custom Fields",
    size: 50000,
    authorSort: null,
    authors: ["Test Author"],
    customColumns: {
      "#myGenre": "Science Fiction",
      "#isRead": true,
    },
  },
})

// Create fresh instances (MST nodes can only belong to one tree)
const fieldMetadataListWithCustom = types.map(FieldMetadataModel).create({
  lastModified: FieldMetadataModel.create({
    name: "Last ModifiedXXXXX",
    datatype: "datetime",
    display: { dateFormat: "yyyy MM dd" },
    ...{ isCategory: false, isCustom: false, isEditable: true, isCsp: false, kind: "test" },
    label: "lastModified",
  }),
  title: FieldMetadataModel.create({
    name: "Title",
    datatype: "text",
    ...{ isCategory: false, isCustom: false, isEditable: true, isCsp: false, kind: "test" },
    label: "title",
  }),
  authors: FieldMetadataModel.create({
    name: "Author",
    datatype: "text",
    isMultiple: { listToUi: "&", cacheToList: "&", uiToList: "&" },
    ...{ isCategory: false, isCustom: false, isEditable: true, isCsp: false, kind: "test" },
    label: "authors",
  }),
  "#myGenre": FieldMetadataModel.create({
    name: "My Genre",
    datatype: "text",
    label: "#myGenre",
    ...customCommonField,
  }),
  "#isRead": FieldMetadataModel.create({
    name: "Is Read",
    datatype: "bool",
    label: "#isRead",
    ...customCommonField,
  }),
})

export const bookDetailFieldListWithCustomFieldsStoryArgs = {
  fieldMetadataList: fieldMetadataListWithCustom,
  book: bookWithCustomColumns,
  borderColor: "$white",
  borderWidth: "$4" as const,
}
