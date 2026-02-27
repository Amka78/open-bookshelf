import { BookEditScreen } from "@/screens/BookEditScreen/BookEditScreen"
import type { Meta, StoryObj } from "@storybook/react"

import { Base as BookDetailFieldListStories } from "@/components/BookDetailFieldList/BookDetailFieldList.stories"
import BookImageItemStories from "@/components/BookImageItem/BookImageItem.stories"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

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
  title: "Screens/BookEditScreen",
} as Meta<typeof BookEditScreen>
type Story = StoryObj<typeof BookEditScreen>
export const Basic: Story = {}
