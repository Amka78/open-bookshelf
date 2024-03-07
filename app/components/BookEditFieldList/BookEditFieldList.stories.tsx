import { BookEditFieldList } from "@/components"
import { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import { FieldMetadataModel } from "@/models/calibre"
import { BookModel } from "@/models/CalibreRootStore"
import { types } from "mobx-state-tree"
import { Base as TestSource } from "../BookDetailFieldList/BookDetailFieldList.stories"
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
    fieldMetadataList: TestSource.args.fieldMetadataList,
    book: TestSource.args.book,
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
