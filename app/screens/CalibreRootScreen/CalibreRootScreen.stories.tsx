import { CalibreRootScreen } from "@/screens/CalibreRootScreen/CalibreRootScreen"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { createCalibreRootStoryRootStore } from "../../../.storybook/stories/screens/bookScreenStoryData"
import {
  playCalibreRootPressesLibrary,
  playCalibreRootShowsLibraryNames,
} from "./calibreRootScreenStoryPlay"

export default {
  component: CalibreRootScreen,
  // CalibreRootScreen は props を取らずストアの libraryMap を読むため、args ではなく
  // rootStore でライブラリを注入する。story 間の状態漏れを避けるため毎回新しく作る。
  decorators: [
    (Story) => (
      <ScreenContainer
        rootStore={createCalibreRootStoryRootStore()}
        stackScreen={{ name: "CalibreRoot", story: () => <Story /> }}
      />
    ),
  ],
  title: "Screens/CalibreRootScreen",
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
  play: async ({ canvasElement }) => {
    await playCalibreRootShowsLibraryNames({
      canvasElement,
      libraryNames: ["library-1", "library-2"],
    })
  },
}

export const PressLibrary: CalibreRootStory = {
  args: {
    libraries: [{ id: "library-1" }, { id: "library-2" }],
  },
  argTypes: {
    onLibraryPress: { action: "onLibraryPress" },
  },
  play: async ({ canvasElement }) => {
    await playCalibreRootPressesLibrary({ canvasElement, libraryName: "library-1" })
  },
}
