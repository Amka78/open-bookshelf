import { ConnectScreen } from "@/screens/ConnectScreen/ConnectScreen"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

export default {
  component: ConnectScreen,
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
  title: "Screens/ConnectScreen",
} as Meta<typeof ConnectScreen>
type ConnectScreenStory = StoryObj<typeof ConnectScreen>
export const Basic: ConnectScreenStory = {
  args: {},
}
export const CanNotConnect: ConnectScreenStory = {
  args: {
    baseUrl: "http://192.168.1.XX:XXXX",
  },
}
