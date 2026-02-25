import { BookDetailScreen } from "@/screens/BookDetailScreen/template/BookDetailScreen"
import type { Meta, StoryObj } from "@storybook/react"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { Base as BookDetailFieldListStories } from "@/components/BookDetailFieldList/BookDetailFieldList.stories"

export default {
  component: BookDetailScreen,
  args: {
    selectedBook: BookDetailFieldListStories.args.book,
    imageUrl: BookImageItemStories.args.source as string,
    fieldNameList: BookDetailFieldListStories.args.fieldNameList,
    fieldMetadataList: BookDetailFieldListStories.args.fieldMetadataList,
  },
  argTypes: {
    onConvertBook: { action: null },
    onDeleteBook: { action: null },
    onDownloadBook: { action: null },
    onOpenBook: { action: null },
  },
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
} as Meta<typeof BookDetailScreen>
type Story = StoryObj<typeof BookDetailScreen>
export const Basic: Story = {}
