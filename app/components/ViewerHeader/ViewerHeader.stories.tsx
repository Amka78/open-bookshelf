import { ViewerHeader } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import {
  viewerMenuStoryArgTypes,
  viewerMenuStoryArgs,
} from "../../../.storybook/stories/data/viewerMenuStoryData"

async function findByTestId(canvasElement: HTMLElement, testId: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Element with data-testid='${testId}' was not found.`)
}

async function playViewerHeaderShowsTitleAndActions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "viewer-header-title")
  await findByTestId(canvasElement, "viewer-toc-button")
  await findByTestId(canvasElement, "viewer-bookmark-button")
  await findByTestId(canvasElement, "viewer-overflow-trigger")
}

export default {
  title: "ViewerHeader",
  component: ViewerHeader,
  args: {
    ...viewerMenuStoryArgs,
    title: "HeaderTitle",
    visible: true,
    autoPageTurning: false,
    // argTypes の action は prop 値を供給しない。これらが undefined だと
    // TOC / ブックマークボタンが条件分岐で描画されない。
    onShowToc: fn(),
    onAddBookmark: fn(),
  },
  argTypes: {
    ...viewerMenuStoryArgTypes,
    onLeftArrowPress: { action: "Pressed Left Arrow." },
    onToggleAutoPageTurning: { action: "Toggle auto page turning." },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: "Viewer display settings in header",
  },
} as Meta<typeof ViewerHeader>

type StoryProps = StoryObj<typeof ViewerHeader>

export const Basic: StoryProps = {
  play: playViewerHeaderShowsTitleAndActions,
}
export const LongTitle: StoryProps = {
  args: {
    title: "HeaderTitleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  },
}
export const Hide: StoryProps = {
  args: {
    visible: false,
  },
}
