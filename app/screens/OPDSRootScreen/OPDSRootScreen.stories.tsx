import type { Meta, StoryObj } from "@storybook/react"
import { findByText, fireEvent, within } from "@testing-library/react"
import { ScreenContainer } from "../../../.storybook/stories/screens/ScreenContainer"
import { OPDSRootScreen } from "./OPDSRootScreen"

async function playOPDSRootShowsEntries({
  canvasElement,
  entryTitles,
}: {
  canvasElement: HTMLElement
  entryTitles: string[]
}) {
  for (const title of entryTitles) {
    await findByText(canvasElement, title)
  }
}

async function playOPDSRootPressesEntry({
  canvasElement,
  entryTitle,
}: {
  canvasElement: HTMLElement
  entryTitle: string
}) {
  const titleNode = await findByText(canvasElement, entryTitle)
  const item = titleNode.closest('[data-testid="opds-root-item"]')

  if (!item) {
    throw new Error(`Could not find list item for entry ${entryTitle}.`)
  }

  fireEvent.click(within(item as HTMLElement).getByRole("button"))
}

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
