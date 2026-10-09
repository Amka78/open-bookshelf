import { Box } from "@/components/Box/Box"
import { Input } from "@/components/Input/Input"
import { Pressable } from "@/components/Pressable/Pressable"
import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { act } from "@testing-library/react"
import { FormInputField } from "./FormInputField"
import { findByTestId, typeInput, waitForAbsence } from "../../../.storybook/stories/storyPlayDom"

import { withComponentHolder } from "../../../.storybook/stories/ComponentHolder"

async function playFocusShowsSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")
}

async function playSuggestionsStayVisibleAfterFocus({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")
  await new Promise((resolve) => {
    setTimeout(resolve, 350)
  })
  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")
}

async function playTypingFiltersSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-input-suggestion-title-Beta")
  await act(async () => {
    typeInput(input, "ga")
  })

  await findByTestId(canvasElement, "form-input-suggestion-title-Gamma")
  await waitForAbsence(canvasElement, "form-input-suggestion-title-Beta")
}

async function playTypingKeepsSuggestionsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  await act(async () => {
    input.focus()
  })

  await act(async () => {
    typeInput(input, "ga")
  })
  await findByTestId(canvasElement, "form-input-suggestion-title-Gamma")

  await new Promise((resolve) => {
    setTimeout(resolve, 300)
  })
  await findByTestId(canvasElement, "form-input-suggestion-title-Gamma")
}

async function playSelectSuggestionUpdatesInput({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await findByTestId(canvasElement, "form-input-story-input")) as HTMLInputElement
  await act(async () => {
    input.focus()
  })

  const candidate = await findByTestId(canvasElement, "form-input-suggestion-title-Beta")
  const mouseEventConstructor = input.ownerDocument.defaultView?.MouseEvent
  if (!mouseEventConstructor) {
    throw new Error("MouseEvent constructor is unavailable.")
  }

  await act(async () => {
    candidate.dispatchEvent(new mouseEventConstructor("mousedown", { bubbles: true }))
    candidate.click()
  })

  for (let retry = 0; retry < 15; retry += 1) {
    if (input.value === "Beta") {
      return
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 20)
    })
  }

  throw new Error(`Expected input value to be 'Beta', but got '${input.value}'.`)
}

async function playSelectSuggestionClosesSuggestionsAndUpdatesInput({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await findByTestId(canvasElement, "form-input-story-input")) as HTMLInputElement
  await act(async () => {
    input.focus()
  })

  const candidateTestId = "form-input-suggestion-title-Beta"
  const candidate = await findByTestId(canvasElement, candidateTestId)
  await act(async () => {
    candidate.click()
  })

  for (let retry = 0; retry < 15; retry += 1) {
    if (input.value === "Beta") {
      break
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 20)
    })
  }

  if (input.value !== "Beta") {
    throw new Error(`Expected input value to be 'Beta', but got '${input.value}'.`)
  }

  await waitForAbsence(canvasElement, candidateTestId)
}

async function playOutsideClickClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await findByTestId(canvasElement, "form-input-story-input")) as HTMLInputElement
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")

  const outside = await findByTestId(canvasElement, "form-input-story-outside")
  const mouseEventConstructor = input.ownerDocument.defaultView?.MouseEvent
  if (!mouseEventConstructor) {
    throw new Error("MouseEvent constructor is unavailable.")
  }

  await act(async () => {
    outside.dispatchEvent(new mouseEventConstructor("mousedown", { bubbles: true }))
    input.blur()
    outside.click()
    // Wait for the scheduled close timer to complete within act
    await new Promise((resolve) => {
      setTimeout(resolve, 150)
    })
  })

  await waitForAbsence(canvasElement, "form-input-suggestion-title-Alpha")
}

async function playBackdropPressClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")

  const backdrop = await findByTestId(canvasElement, "form-input-backdrop-title")
  await act(async () => {
    backdrop.click()
    // Wait for any scheduled state updates to settle
    await new Promise((resolve) => {
      setTimeout(resolve, 50)
    })
  })

  await waitForAbsence(canvasElement, "form-input-suggestion-title-Alpha")
}

type StoryForm = {
  title: string | null
}

type WrapperProps = {
  suggestions: string[]
}

export function FormInputFieldStoryWrapper({ suggestions }: WrapperProps) {
  const form = useForm<StoryForm>({
    defaultValues: {
      title: null,
    },
  })

  return (
    <Box width="$full" padding="$4">
      <Input width="$full">
        <FormInputField
          control={form.control}
          name="title"
          suggestions={suggestions}
          width="$full"
          testID="form-input-story-input"
        />
      </Input>
      <Pressable testID="form-input-story-outside">
        <Box height="$10" />
      </Pressable>
    </Box>
  )
}

export default {
  title: "Forms/FormInputField",
  component: FormInputFieldStoryWrapper,
  decorators: [withComponentHolder],
  args: {
    suggestions: ["Alpha", "Beta", "Gamma", "Delta"],
  },
} as Meta<typeof FormInputFieldStoryWrapper>

type Story = StoryObj<typeof FormInputFieldStoryWrapper>

export const Basic: Story = {}

export const FocusShowsSuggestions: Story = {
  play: playFocusShowsSuggestions,
}

export const SuggestionsStayVisibleAfterFocus: Story = {
  play: playSuggestionsStayVisibleAfterFocus,
}

export const TypingFiltersSuggestions: Story = {
  play: playTypingFiltersSuggestions,
}

export const TypingKeepsSuggestionsVisible: Story = {
  play: playTypingKeepsSuggestionsVisible,
}

export const SelectSuggestionUpdatesInput: Story = {
  play: playSelectSuggestionUpdatesInput,
}

export const SelectSuggestionClosesSuggestionsAndUpdatesInput: Story = {
  play: playSelectSuggestionClosesSuggestionsAndUpdatesInput,
}

export const OutsideClickClosesSuggestions: Story = {
  play: playOutsideClickClosesSuggestions,
}

export const BackdropPressClosesSuggestions: Story = {
  play: playBackdropPressClosesSuggestions,
}
