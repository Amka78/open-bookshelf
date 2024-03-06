import { BookDetailFieldList } from "@/components"
import { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { FieldMetadataModel } from "@/models/calibre"
import { BookModel } from "@/models/CalibreRootStore"
import { types } from "mobx-state-tree"

const CommonField = {
  isCategory: false,
  isCustom: false,
  isEditable: false,
  isCsp: false,
  kind: "test",
}
const lastModifiedTestField = FieldMetadataModel.create({
  name: "Last ModifiedXXXXX",
  datatype: "datetime",
  display: {
    dateFormat: "yyyy MM dd",
  },
  ...CommonField,
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
  ...CommonField,
  label: "fortmats",
})

const ratingTestField = FieldMetadataModel.create({
  name: "Rating",
  datatype: "rating",
  ...CommonField,
  label: "rating",
})

const sizeTestField = FieldMetadataModel.create({
  name: "Size",
  datatype: "float",
  ...CommonField,
  label: "size",
})

const titleTestField = FieldMetadataModel.create({
  name: "Title",
  datatype: "text",
  ...CommonField,
  label: "title",
})

const authorTestField = FieldMetadataModel.create({
  name: "Author",
  datatype: "text",
  ...CommonField,
  isMultiple: {
    listToUi: "&",
    cacheToList: "&",
    uiToList: "&",
  },
  label: "author",
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

const bookFieldList = [
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

export default {
  title: "BookDetailFieldList",
  component: BookDetailFieldList,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  args: {
    fieldNameList: bookFieldList,
    fieldMetadataList: fieldMetadataList,
    book: book,
    borderColor: "$white",
    borderWidth: "$4",
  },
  argTypes: {
    onLinkPress: { action: "Pressed Link." },
  },
  parameters: {
    notes: `
    List FieldMetadata.
`,
  },
} as Meta<typeof BookDetailFieldList>

type StoryProps = StoryObj<typeof BookDetailFieldList>

export const Base: StoryProps = {}
