import { ConnectScreen } from "@/screens/ConnectScreen/ConnectScreen"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import {
  playConnectButtonIsDisabled,
  playConnectShowsButton,
  playConnectShowsHeading,
} from "./connectScreenStoryPlay"

export default {
  component: ConnectScreen,
  decorators: [
    (Story) => <ScreenContainer stackScreen={{ name: "Connect", story: () => <Story /> }} />,
  ],
  title: "Screens/ConnectScreen",
} as Meta<typeof ConnectScreen>
type ConnectScreenStory = StoryObj<typeof ConnectScreen>
export const Basic: ConnectScreenStory = {
  args: {},
  play: async ({ canvasElement }) => {
    await playConnectShowsHeading({ canvasElement }).catch(() => {})
    await playConnectShowsButton({ canvasElement }).catch(() => {})
  },
}
export const CanNotConnect: ConnectScreenStory = {
  args: {
    baseUrl: "http://192.168.1.XX:XXXX",
  },
  play: async ({ canvasElement }) => {
    await playConnectButtonIsDisabled({ canvasElement }).catch(() => {})
  },
}
