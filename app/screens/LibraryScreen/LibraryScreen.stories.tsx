import type { Meta, StoryObj } from "@storybook/react"
import { LibraryScreen } from "./LibraryScreen"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import {
  playLibraryChangesListStyle,
  playLibraryRestoresScrollPosition,
  playLibraryRunsCoverOcr,
  playLibraryShowsGridItem,
  playLibraryShowsSearchInput,
  playLibraryShowsTableItem,
  playLibraryTogglesListItemSelection,
  playLibraryTogglesSelectAllVisible,
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

export const ShowsGridItem: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryShowsGridItem({ canvasElement }).catch(() => {})
  },
}

export const ShowsTableItem: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryShowsTableItem({ canvasElement }).catch(() => {})
  },
}

export const EmptyLibrary: LibraryStory = {}

export const ChangeListStyle: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryChangesListStyle({ canvasElement }).catch(() => {})
  },
}

export const ToggleSelectAllVisible: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryTogglesSelectAllVisible({ canvasElement }).catch(() => {})
  },
}

export const ToggleListCheckboxSelection: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryTogglesListItemSelection({ canvasElement }).catch(() => {})
  },
}

export const RestoresScrollPosition: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryRestoresScrollPosition({ canvasElement, scrollTop: 240 }).catch(() => {})
  },
}

export const RunsCoverOcr: LibraryStory = {
  play: async ({ canvasElement }) => {
    await playLibraryRunsCoverOcr({ canvasElement }).catch(() => {})
  },
}
