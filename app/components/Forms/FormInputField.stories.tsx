import { Box } from "@/components/Box/Box"
import { Pressable } from "@/components/Pressable/Pressable"
import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { FormInputField } from "./FormInputField"
import {
  playBackdropPressClosesSuggestions,
  playFocusShowsSuggestions,
  playOutsideClickClosesSuggestions,
  playSelectSuggestionClosesSuggestionsAndUpdatesInput,
  playSelectSuggestionUpdatesInput,
  playSuggestionsStayVisibleAfterFocus,
  playTypingFiltersSuggestions,
  playTypingKeepsSuggestionsVisible,
} from "./formInputFieldStoryPlay"

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
      <FormInputField
        control={form.control}
        name="title"
        suggestions={suggestions}
        width="$full"
        testID="form-input-story-input"
      />
      <Pressable testID="form-input-story-outside">
        <Box height="$10" />
      </Pressable>
    </Box>
  )
}

export default {
  title: "Forms/FormInputField",
  component: FormInputFieldStoryWrapper,
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
