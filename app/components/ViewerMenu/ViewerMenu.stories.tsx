import { ViewerMenu } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

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

async function playViewerMenuShowsActionsTrigger({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "viewer-overflow-trigger")
}

export default {
  title: "ViewerMenu",
  component: ViewerMenu,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: "Viewer display settings.",
  },
} as Meta<typeof ViewerMenu>

type StoryProps = StoryObj<typeof ViewerMenu>

export const Basic: StoryProps = {
  args: viewerMenuStoryArgs,
  argTypes: viewerMenuStoryArgTypes,
  play: playViewerMenuShowsActionsTrigger,
}
