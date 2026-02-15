import type { Meta, StoryObj } from "@storybook/react"
import { PageManagerWithState } from "./PageManagerWithState"
import { logger } from "@/utils/logger"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "PageManager",
  component: PageManagerWithState,
  parameters: {
    notes: `Use the slider to move through the pages of the book.`,
  },
  args: {
    initialPage: 0,
    totalPage: 199,
    variant: "free",
  },
  argTypes: {
    onPageChange: (page) => {
      logger.debug("Selected page", page)
    },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof PageManagerWithState>

type StoryProps = StoryObj<typeof PageManagerWithState>

export const Basic: StoryProps = {}
export const Reverse: StoryProps = {
  args: {
    reverse: true,
  },
}
export const Invisible: StoryProps = {
  args: {
    visible: false,
  },
}
export const FixedRepresentation: StoryProps = {
  args: {
    variant: "fix",
  },
}
