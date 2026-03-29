import type { Meta, StoryObj } from "@storybook/react"
import { LibraryScreen } from "./LibraryScreen"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import {
  playLibraryChangesListStyle,
  playLibraryShowsSearchInput,
} from "./libraryScreenStoryPlay"

export default {
  component: LibraryScreen,
  decorators: [
    (Story) => <ScreenContainer stackScreen={{ name: "Library", story: () => <Story /> }} />,
  ],
  title: "Screens/LibraryScreen",
} as Meta<typeof LibraryScreen>

type LibraryStory = StoryObj<typeof LibraryScreen>

export const Basic: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryShowsSearchInput({
      canvasElement,
      placeholder: "Search",
    }).catch(() => {})
  },
}

export const WithSearchResults: LibraryStory = {}

export const EmptyLibrary: LibraryStory = {}

export const ChangeListStyle: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryChangesListStyle({ canvasElement }).catch(() => {})
  },
}
