import { ViewerMenu } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import {
  viewerMenuStoryArgTypes,
  viewerMenuStoryArgs,
} from "../../../.storybook/stories/data/viewerMenuStoryData"
import { playViewerMenuShowsActionsTrigger } from "./viewerMenuStoryPlay"

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
