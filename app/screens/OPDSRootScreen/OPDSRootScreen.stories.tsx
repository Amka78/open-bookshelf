import type { Meta, StoryObj } from "@storybook/react-native"
import { ScreenContainer } from "@storybook/react-native/addons/storybook.requires"
import { OPDSRootScreen } from "./OPDSRootScreen"

const meta: Meta<typeof OPDSRootScreen> = {
  title: "Screens/OPDSRootScreen",
  component: OPDSRootScreen,
  decorators: [
    (Story) => (
      <ScreenContainer>
        <Story />
      </ScreenContainer>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

type Story = StoryObj<typeof meta>

/**
 * Basic OPDS Root Screen showing catalog entries
 */
export const Basic: Story = {
  args: {},
  decorators: [
    (Story) => {
      return <Story />
    },
  ],
}

/**
 * OPDS Root Screen with multiple entries
 */
export const WithEntries: Story = {
  args: {},
  decorators: [
    (Story) => {
      return <Story />
    },
  ],
}

/**
 * OPDS Root Screen in loading state
 */
export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => {
      return <Story />
    },
  ],
}

/**
 * OPDS Root Screen with empty entries
 */
export const Empty: Story = {
  args: {},
  decorators: [
    (Story) => {
      return <Story />
    },
  ],
}
