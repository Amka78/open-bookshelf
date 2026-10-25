import { fireEvent } from "@testing-library/react"
import { BookEditFieldNavList } from "./BookEditFieldNavList"
import type { Meta, StoryObj } from "@storybook/react"
import type { ComponentProps } from "react"
import { useForm } from "react-hook-form"
import { getSnapshot } from "mobx-state-tree"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import {
  bookDetailFieldListStoryArgs,
  bookDetailFieldListWithCustomFieldsStoryArgs,
} from "../../../.storybook/stories/data/bookDetailFieldListStoryData"
import type { MetadataSnapshotIn } from "@/models/calibre"

/** Click the Custom Fields tab */
async function playCustomFieldsTab({
  canvasElement,
}: {
  canvasElement: HTMLElement
}): Promise<void> {
  const customTab = canvasElement.querySelector<HTMLElement>('[data-testid="book-edit-tab-custom"]')
  if (!customTab) throw new Error("Custom fields tab not found in canvas")
  fireEvent.click(customTab)
}

function FormBookEditFieldNavList(props: Omit<ComponentProps<typeof BookEditFieldNavList>, "control">) {
  const form = useForm<MetadataSnapshotIn>({
    defaultValues: props.book.metaData
      ? (getSnapshot(props.book.metaData) as MetadataSnapshotIn)
      : undefined,
  })
  return <BookEditFieldNavList {...props} control={form.control} />
}

export default {
  title: "BookEditFieldNavList",
  component: FormBookEditFieldNavList,
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
    onOpenField: { action: "openField." },
  },
  parameters: {
    notes: "EditScreen専用: テキスト系フィールドは行タップで遷移、非テキスト系はインライン表示。",
  },
} as Meta<typeof FormBookEditFieldNavList>

type StoryProps = StoryObj<typeof FormBookEditFieldNavList>

export const Base: StoryProps = {}

export const WithCustomFields: StoryProps = {
  args: {
    fieldMetadataList: bookDetailFieldListWithCustomFieldsStoryArgs.fieldMetadataList,
    book: bookDetailFieldListWithCustomFieldsStoryArgs.book,
  },
  play: playCustomFieldsTab,
}