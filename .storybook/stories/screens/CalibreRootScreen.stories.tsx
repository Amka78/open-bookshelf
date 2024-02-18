import { CalibreRootScreen } from "@/screens/CalibreRootScreen/template/CalibreRootScreen"
import { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ScreenContainer } from "./ScreenContainer"

export default {
  component: CalibreRootScreen,
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
} as Meta<typeof CalibreRootScreen>
type CalibreRootStory = StoryObj<typeof CalibreRootScreen>
export const Basic: CalibreRootStory = {
  args: {
    libraries: [
      { id: "library-1" },
      { id: "library-2" },
      { id: "library-3" },
      { id: "library-4" },
      { id: "library-5" },
    ],
  },
  argTypes: {
    onLibraryPress: { action: "onLibraryPress" },
  },
}
