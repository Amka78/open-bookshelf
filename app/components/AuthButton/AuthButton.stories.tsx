import { Meta, StoryObj } from "@storybook/react"
import { AuthButton } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "AuthButton",
  component: AuthButton,
  argTypes: {
    onLoginPress: { action: "execute login." },
  },
  args: { mode: "login" },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof AuthButton>

type ButtonStory = StoryObj<typeof AuthButton>

export const Login: ButtonStory = {}
export const Logout: ButtonStory = {
  argTypes: {
    onLogoutPress: { action: "execute logout" },
  },
  args: {
    mode: "logout",
  },
}
