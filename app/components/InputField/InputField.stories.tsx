import { Input } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"
import { InputField } from "./InputField"
import { playShowsPlaceholder, playTypingUpdatesInput } from "./inputFieldStoryPlay"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "InputField",
  component: InputField,
  parameters: {
    notes: "InputField",
  },
  args: {
    placeholderTx: "connectScreen.placeHolder",
  },
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Input>
          <Story />
        </Input>
      </ComponentHolder>
    ),
  ],
} as Meta<typeof InputField>

type StoryProps = StoryObj<typeof InputField>

export const Basic: StoryProps = {
  play: async ({ canvasElement }) => {
    await playShowsPlaceholder({
      canvasElement,
      placeholder: "(http or https)://{Address}:{Port}",
    })
    await playTypingUpdatesInput({
      canvasElement,
      placeholder: "(http or https)://{Address}:{Port}",
      value: "http://localhost:8080",
    })
  },
}
