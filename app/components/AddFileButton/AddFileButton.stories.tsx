import { AddFileButton } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

const markdown = `
    Button for file addition process.
When the button is clicked, a file selection dialog opens, allowing the user to select one file to upload.
`
export default {
  title: "AddFileButton",
  component: AddFileButton,
  argTypes: {
    onDocumentSelect: { action: "Selected document." },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: markdown,
  },
} as Meta<typeof AddFileButton>

type StoryProps = StoryObj<typeof AddFileButton>

export const Basic: StoryProps = {}
