import { fireEvent } from "@testing-library/react"
import { Input } from "@/components"
import type { Meta, StoryObj } from "@storybook/react"
import { InputField } from "./InputField"

import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

function findInputByPlaceholder(canvasElement: HTMLElement, placeholder: string): HTMLInputElement {
  const input = canvasElement.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement | null

  if (!input) {
    throw new Error(`Input with placeholder '${placeholder}' was not found.`)
  }

  return input
}

async function playShowsPlaceholder({
  canvasElement,
  placeholder,
}: {
  canvasElement: HTMLElement
  placeholder: string
}) {
  findInputByPlaceholder(canvasElement, placeholder)
}

async function playTypingUpdatesInput({
  canvasElement,
  placeholder,
  value,
}: {
  canvasElement: HTMLElement
  placeholder: string
  value: string
}) {
  const input = findInputByPlaceholder(canvasElement, placeholder)

  fireEvent.change(input, { target: { value } })

  if (input.value !== value) {
    throw new Error(`Expected input value to be '${value}'.`)
  }
}

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
