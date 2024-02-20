import { BookDetailField } from "@/components"
import { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { FieldMetadataModel } from "@/models/calibre"

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
export default {
  title: "BookDetailField",
  component: BookDetailField,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  argTypes: {
    onLinkPress: { action: "Pressed Link." },
  },
  parameters: {
    notes: `
    Generate a field corresponding to the DataType in the FieldMetadata.
`,
  },
} as Meta<typeof BookDetailField>

type StoryProps = StoryObj<typeof BookDetailField>

export const RatingField: StoryProps = {
  args: {
    fieldMetadata: ratingTestField,
    value: 10,
  },
}
export const NumberField: StoryProps = {
  args: {
    fieldMetadata: sizeTestField,
    value: 2000000,
  },
}
export const DateField: StoryProps = {
  args: {
    fieldMetadata: lastModifiedTestField,
    value: "2023-12-18T18:25:04+00:00",
  },
}
export const FormatField: StoryProps = {
  args: {
    fieldMetadata: formatsTestField,
    value: ["CBZ", "PDF"],
  },
}
export const TitleField: StoryProps = {
  args: {
    fieldMetadata: titleTestField,
    value: "TestBookTitle1",
  },
}
export const AuthorField: StoryProps = {
  args: {
    fieldMetadata: authorTestField,
    value: ["Author1", "Author2"],
  },
}
