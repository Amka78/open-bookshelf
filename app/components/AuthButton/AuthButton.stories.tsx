import { AuthButton } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "AuthButton",
  component: AuthButton,
  argTypes: {
    onLoginPress: { action: "Execute login." },
  },
  args: { mode: "login" },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `
    Buttons for login and logout processes. 
    The event corresponding to the mode is executed when the button is pressed.
`,
  },
} as Meta<typeof AuthButton>

type StoryProps = StoryObj<typeof AuthButton>

export const Login: StoryProps = {}
export const Logout: StoryProps = {
  argTypes: {
    onLogoutPress: { action: "Execute logout" },
  },
  args: {
    mode: "logout",
  },
}
