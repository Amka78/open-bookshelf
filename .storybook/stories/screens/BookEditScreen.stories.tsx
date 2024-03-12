import { BookEditScreen } from "@/screens/BookDetailScreen/template/BookDetailScreen"
import type { Meta, StoryObj } from "@storybook/react"

import { ScreenContainer } from "./ScreenContainer"
import { Base as BookDetailFieldListStories } from "@/components/BookDetailFieldList/BookDetailFieldList.stories"

export default {
  component: BookEditScreen,
  args: {
    selectedBook: BookDetailFieldListStories.args.book,
    imageUrl: BookImageItemStories.args.source as string,
    fieldMetadataList: BookDetailFieldListStories.args.fieldMetadataList,
  },
  argTypes: {
    onSubmitPress: { action: null },
  },
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
} as Meta<typeof BookEditScreen>
type Story = StoryObj<typeof BookEditScreen>
export const Basic: Story = {}
