import type { Meta, StoryObj } from "@storybook/react"
import { LibraryScreen } from "./LibraryScreen"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"

export default {
  component: LibraryScreen,
  decorators: [
    (Story) => <ScreenContainer stackScreen={{ name: "Library", story: () => <Story /> }} />,
  ],
  title: "Screens/LibraryScreen",
} as Meta<typeof LibraryScreen>

type LibraryStory = StoryObj<typeof LibraryScreen>

export const Basic: LibraryStory = {}

export const WithSearchResults: LibraryStory = {}

export const EmptyLibrary: LibraryStory = {}
