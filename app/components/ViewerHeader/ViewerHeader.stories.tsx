import { ViewerHeader } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "@storybook/test"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import {
  viewerMenuStoryArgTypes,
  viewerMenuStoryArgs,
} from "../../../.storybook/stories/data/viewerMenuStoryData"
import { playViewerHeaderShowsTitleAndActions } from "./viewerHeaderStoryPlay"

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
