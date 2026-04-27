import { BookEditFieldList } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import {
  bookDetailFieldListStoryArgs,
  bookDetailFieldListWithCustomFieldsStoryArgs,
} from "../../../.storybook/stories/data/bookDetailFieldListStoryData"
import { playCustomFieldsTab } from "./bookEditFieldListStoryPlay"
import { FormBookEditFieldList } from "./FormBookEditFieldList"

export default {
  title: "BookEditFieldList",
  component: FormBookEditFieldList,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  args: {
    fieldMetadataList: bookDetailFieldListStoryArgs.fieldMetadataList,
    book: bookDetailFieldListStoryArgs.book,
  },
  argTypes: {
    onSubmit: { action: "submit." },
  },
  parameters: {
    notes: "EditableFieldList.",
  },
} as Meta<typeof FormBookEditFieldList>

type StoryProps = StoryObj<typeof FormBookEditFieldList>

export const Base: StoryProps = {}

export const WithCustomFields: StoryProps = {
  args: {
    fieldMetadataList: bookDetailFieldListWithCustomFieldsStoryArgs.fieldMetadataList,
    book: bookDetailFieldListWithCustomFieldsStoryArgs.book,
  },
  play: playCustomFieldsTab,
}
