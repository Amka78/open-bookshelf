import { CalibreRootScreen } from "@/screens/CalibreRootScreen/CalibreRootScreen"
import type { Meta, StoryObj } from "@storybook/react"
import { findByText, fireEvent } from "@testing-library/react"
import React from "react"

import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { createCalibreRootStoryRootStore } from "../../../.storybook/stories/screens/bookScreenStoryData"

async function playCalibreRootShowsLibraryNames({
  canvasElement,
  libraryNames,
}: {
  canvasElement: HTMLElement
  libraryNames: string[]
}) {
  for (const libraryName of libraryNames) {
    await findByText(canvasElement, libraryName)
  }
}

async function playCalibreRootPressesLibrary({
  canvasElement,
  libraryName,
}: {
  canvasElement: HTMLElement
  libraryName: string
}) {
  const row = await findByText(canvasElement, libraryName)
  const pressable = row.closest('[data-testid="calibre-root-item"]')

  if (!pressable) {
    throw new Error(`Could not find pressable item for library ${libraryName}.`)
  }

  fireEvent.click(pressable)
}

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
