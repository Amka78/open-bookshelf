import { BookDetailFieldList } from "@/components"
import { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { FieldMetadataModel } from "@/models/calibre"
import { BookModel } from "@/models/CalibreRootStore"
import { types } from "mobx-state-tree"
import {
  AuthorField,
  DateField,
  FormatField,
  RatingField,
  TitleField,
} from "../BookDetailField/BookDetailField.stories"

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
  lastModified: DateField.args.fieldMetadata,
  formats: FormatField.args.fieldMetadata,
  rating: RatingField.args.fieldMetadata,
  title: TitleField.args.fieldMetadata,
  authors: AuthorField.args.fieldMetadata,
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
