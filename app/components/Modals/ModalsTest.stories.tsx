import type { Meta, StoryObj } from "@storybook/react"
import { ModalTestContainer } from "./ModalTestContainer"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "Modals Test",
  component: ModalTestContainer,
  argTypes: {
    onLoginPress: { action: null },
    onOKPress: { action: null },
    onSelectFormat: { action: null },
    onConvertBook: { action: null },
    onDeleteBook: { action: null },
    onDownloadBook: { action: null },
    onOpenBook: { action: null },
  },
  parameters: {
    notes: "Press the button to confirm the corresponding modal.",
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
