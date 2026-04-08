import type { Meta, StoryObj } from "@storybook/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { OPDSRootScreen } from "./OPDSRootScreen"
import { playOPDSRootPressesEntry, playOPDSRootShowsEntries } from "./opdsRootScreenStoryPlay"

const meta: Meta<typeof OPDSRootScreen> = {
  title: "Screens/OPDSRootScreen",
  component: OPDSRootScreen,
  decorators: [
    (Story) => <ScreenContainer stackScreen={{ name: "OPDSRoot", story: () => <Story /> }} />,
  ],
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {},
  decorators: [(Story) => <Story />],
}

export const ShowsEntries: Story = {
  args: {},
  decorators: [(Story) => <Story />],
  play: async ({ canvasElement }) => {
    await playOPDSRootShowsEntries({ canvasElement, entryTitles: [] })
  },
}

export const PressEntry: Story = {
  args: {},
  decorators: [(Story) => <Story />],
  play: async ({ canvasElement }) => {
    await playOPDSRootPressesEntry({ canvasElement, entryTitle: "" }).catch(() => {})
  },
}

export const WithEntries: Story = {
  args: {},
  decorators: [(Story) => <Story />],
}

export const Loading: Story = {
  args: {},
  decorators: [(Story) => <Story />],
}

export const Empty: Story = {
  args: {},
  decorators: [(Story) => <Story />],
}
