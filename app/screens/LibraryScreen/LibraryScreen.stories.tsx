import type { Meta, StoryObj } from "@storybook/react"
import React from "react"
import { LibraryScreen } from "./LibraryScreen"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

export default {
  component: LibraryScreen,
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
  title: "Screens/LibraryScreen",
} as Meta<typeof LibraryScreen>

type LibraryStory = StoryObj<typeof LibraryScreen>

export const Basic: LibraryStory = {}

export const WithSearchResults: LibraryStory = {}

export const EmptyLibrary: LibraryStory = {}
