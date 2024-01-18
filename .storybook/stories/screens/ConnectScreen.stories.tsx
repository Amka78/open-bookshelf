import { ConnectScreen } from "@/screens/ConnectScreen/template/ConnectScreen"
import { delay } from "@/utils/delay"
import { ComponentMeta, ComponentStoryObj } from "@storybook/react-native"
import React from "react"

import { ScreenContainer } from "./ScreenContainer"

export default ({
  component: ConnectScreen,
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
} as ComponentMeta<typeof ConnectScreen>)
type ConnectScreenStory = ComponentStoryObj<typeof ConnectScreen>
export const Basic: ConnectScreenStory = {
  args: {},
}
export const CanNotConnect: ConnectScreenStory = {
  args: {
    baseUrl: "http://192.168.1.XX:XXXX",
  },
}
