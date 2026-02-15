import { BookImageItem, PagePressable } from "@/components"
import { logger } from "@/utils/logger"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "PagePressable",
  component: PagePressable,
  parameters: {
    notes: `Manages the page press process.`,
  },
  args: {
    children: <BookImageItem source={require("../../../assets/images/sample-image-1.png")} />,
    currentPage: 0,
    totalPages: 200,
    direction: "previous",
    transitionPages: 1,
  },
  argTypes: {
    onLongPress: { action: "Long press page." },
    onPageChanged: { action: "Change page." },
    onPageChanging: (currentPage) => {
      logger.debug("Next page", currentPage)
    },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof PagePressable>

type StoryProps = StoryObj<typeof PagePressable>

export const FirstPagwePageDirectionPrevious: StoryProps = {
  args: {
    currentPage: 0,
    direction: "previous",
  },
}

export const FirstPagwePageDirectionNext: StoryProps = {
  args: {
    currentPage: 0,
    direction: "next",
  },
}

export const LastPagwePageDirectionPrevious: StoryProps = {
  args: {
    currentPage: 200,
    direction: "previous",
  },
}

export const LastPagwePageDirectionNext: StoryProps = {
  args: {
    currentPage: 200,
    direction: "next",
  },
}
