import { Meta, StoryObj } from "@storybook/react"
import { AddFileButton } from "@/components"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "AddFileButton",
  component: AddFileButton,
  argTypes: {
    onDocumentSelect: { action: "document selected" },
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
  parameters: {
    notes: `
    Button for file addition process.
When the button is clicked, a file selection dialog opens, allowing the user to select one file to upload.
`,
  },
} as Meta<typeof AddFileButton>

type ButtonStory = StoryObj<typeof AddFileButton>

export const Basic: ButtonStory = {}
