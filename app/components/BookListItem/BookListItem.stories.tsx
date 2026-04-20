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
    onPress: { action: "pressed (toggle selection)" },
    onLongPress: { action: "long pressed (open book)" },
  },
}

export const WithImage: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
  },
  argTypes: {
    onPress: { action: "pressed (toggle selection)" },
    onLongPress: { action: "long pressed (open book)" },
  },
}

export const SelectionModeTogglesOnPress: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
    isSelected: false,
    onPress: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const row = canvas.getByRole("button")
    await userEvent.click(row)
    await expect(args.onPress).toHaveBeenCalled()
  },
}

export const SelectionModeChecked: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
    isSelected: true,
    onPress: fn(),
  },
  argTypes: {
    onPress: { action: "pressed (toggle selection off)" },
    onLongPress: { action: "long pressed (open book)" },
  },
}

export const SingleSelectionActions: BookListItemStory = {
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
    isSelected: true,
    showSelectionActions: true,
    onPress: fn(),
    detailMenuProps: {
      onOpenBook: async () => {},
      onDownloadBook: () => {},
      onConvertBook: () => {},
      onEditBook: () => {},
      onDeleteBook: () => {},
      onOpenBookDetail: () => {},
    },
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
    onPress: { action: "pressed (toggle selection)" },
    onLongPress: { action: "long pressed (open book)" },
  },
}
