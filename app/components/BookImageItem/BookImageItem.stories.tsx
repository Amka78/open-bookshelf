import { act, fireEvent } from "@testing-library/react"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"
import React from "react"
import { BookImageItem } from "./BookImageItem"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

function findElementByTestId(canvasElement: HTMLElement, testId: string): HTMLElement {
  const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null

  if (!found) {
    throw new Error(`Element with data-testid='${testId}' was not found.`)
  }

  return found
}

async function playBookImageItemSelectedSearchPressesAuthorLink({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  findElementByTestId(canvasElement, "book-image-hover-overlay")
  findElementByTestId(canvasElement, "book-image-hover-title-authors")
  findElementByTestId(canvasElement, "book-image-hover-title-series")
  findElementByTestId(canvasElement, "book-image-hover-title-tags")
  findElementByTestId(canvasElement, "book-image-hover-title-formats")

  await act(async () => {
    fireEvent.click(
      findElementByTestId(canvasElement, "book-image-hover-link-authors-Ursula K. Le Guin"),
    )
  })
}

async function playBookImageItemShowsDetailMenuWhenSelected({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  findElementByTestId(canvasElement, "book-image-detail-menu-overlay")
}

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
    // argTypes の action は prop 値を供給しない。undefined だと showHoverSearchOverlay が
    // false になり overlay 全体が描画されない。
    onHoverSearchPress: fn(),
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
