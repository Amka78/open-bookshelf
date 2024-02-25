import { Meta, StoryObj } from "@storybook/react"
import { ModalTestContainer } from "./ModalTestContainer"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Modals Test",
  component: ModalTestContainer,
  parameters: {
    notes: `Press the button to confirm the corresponding modal.`,
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof ModalTestContainer>

type StoryProps = StoryObj<typeof ModalTestContainer>

export const Basic: StoryProps = {}