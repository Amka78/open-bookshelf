import { BookListItem } from "@/components"
import type { Book } from "@/models/calibre/BookModel"
import type { Meta, StoryFn, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "@storybook/test"
import React from "react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

const mockBook: Book = {
  id: 1,
  metaData: {
    title: "Test Book Title",
    authors: ["Test Author"],
    formats: ["EPUB", "PDF"],
    tags: [],
    pubdate: null,
    author_sort: "Author, Test",
    last_modified: "2024-01-01",
    series: null,
    series_index: 0,
    size: 1000000,
    sort: "Test Book Title",
    timestamp: "2024-01-01",
    uuid: "test-uuid",
    rating: 0,
    languages: ["eng"],
    lang_names: ["English"],
    format_sizes: [],
    publisher: null,
    comments: null,
    identifiers: {},
  },
} as unknown as Book

export default {
  title: "BookListItem",
  component: BookListItem,
  decorators: [
    (Story: StoryFn) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  args: {
    book: mockBook,
    source: undefined,
  },
} as Meta<typeof BookListItem>

type BookListItemStory = StoryObj<typeof BookListItem>

export const Default: BookListItemStory = {
  argTypes: {
    onPress: { action: "pressed (open book)" },
    onLongPress: { action: "long pressed (detail)" },
  },
}

export const WithImage: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
  },
  argTypes: {
    onPress: { action: "pressed (open book)" },
    onLongPress: { action: "long pressed (detail)" },
  },
}

export const SelectionModeWithCheckbox: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
    isSelected: false,
    onPress: fn(),
    onSelectToggle: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // The checkbox icon should be clickable
    const checkbox = canvas.getByRole("button")
    await userEvent.click(checkbox)
    await expect(args.onSelectToggle).toHaveBeenCalled()
    // onPress should NOT be called when checkbox is clicked
    await expect(args.onPress).not.toHaveBeenCalled()
  },
}

export const SelectionModeChecked: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
    isSelected: true,
    onSelectToggle: fn(),
  },
  argTypes: {
    onPress: { action: "pressed (open book - disabled in selection mode)" },
    onLongPress: { action: "long pressed (detail - disabled in selection mode)" },
    onSelectToggle: { action: "toggle selection" },
  },
}

export const WithProgress: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
    readingProgress: 0.42,
    isCached: true,
    readStatus: "reading",
  },
  argTypes: {
    onPress: { action: "pressed (open book)" },
    onLongPress: { action: "long pressed (detail)" },
  },
}
