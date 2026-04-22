import { BookImageItem } from "./BookImageItem"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import {
  playBookImageItemSelectedSearchPressesAuthorLink,
  playBookImageItemShowsDetailMenuWhenSelected,
} from "./bookImageItemStoryPlay"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "BookImageItem",
  component: BookImageItem,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  args: {
    source: require("../../../assets/images/sample-image-1.png"),
  },
} as Meta<typeof BookImageItem>

type BookImageItemStory = StoryObj<typeof BookImageItem>

export const Pressable: BookImageItemStory = {
  argTypes: {
    onPress: { action: "open book." },
    onLongPress: { action: "open detail screen." },
  },
}

export const JustImage: BookImageItemStory = {}
export const Loading: BookImageItemStory = {
  args: {
    loading: true,
  },
}

export const SelectedSearchLinks: BookImageItemStory = {
  argTypes: {
    onHoverSearchPress: { action: "search book metadata" },
  },
  args: {
    selected: true,
    showSelectionDetails: true,
    hoverSearchMetadata: {
      authors: ["Ursula K. Le Guin"],
      series: "Earthsea",
      tags: ["Fantasy"],
      formats: ["epub"],
    },
  },
  play: playBookImageItemSelectedSearchPressesAuthorLink,
}

export const SelectedDetailMenu: BookImageItemStory = {
  args: {
    selected: true,
    showSelectionDetails: true,
    detailMenuProps: {
      onOpenBook: async () => {},
      onDownloadBook: () => {},
      onConvertBook: () => {},
      onEditBook: () => {},
      onDeleteBook: () => {},
      onOpenBookDetail: () => {},
    },
  },
  play: playBookImageItemShowsDetailMenuWhenSelected,
}
