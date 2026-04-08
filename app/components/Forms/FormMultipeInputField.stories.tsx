import { Box } from "@/components/Box/Box"
import { Pressable } from "@/components/Pressable/Pressable"
import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { FormMultipleInputField } from "./FormMultipeInputField"
import {
  playMultipleBackdropPressClosesSuggestions,
  playMultipleFocusShowsSuggestions,
  playMultipleOutsideClickClosesSuggestions,
  playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput,
  playMultipleSelectSuggestionUpdatesInput,
  playMultipleSuggestionsStayVisibleAfterFocus,
  playMultipleTypingFiltersSuggestions,
  playMultipleTypingKeepsSuggestionsVisible,
} from "./formMultipleInputFieldStoryPlay"

type StoryForm = {
  tags: string[]
}

type WrapperProps = {
  suggestions: string[]
}

export function FormMultipleInputFieldStoryWrapper({ suggestions }: WrapperProps) {
  const form = useForm<StoryForm>({
    defaultValues: {
      tags: [""],
    },
  })

  return (
    <Box width="$full" padding="$4">
      <FormMultipleInputField
        control={form.control}
        name="tags"
        suggestions={suggestions}
        width="$full"
        testID="form-multiple-input-story"
        textToValue=","
        valueToText=","
      />
      <Pressable testID="form-multiple-input-story-outside">
        <Box height="$10" />
      </Pressable>
    </Box>
  )
}

export default {
  title: "Forms/FormMultipleInputField",
  component: FormMultipleInputFieldStoryWrapper,
  args: {
    suggestions: ["Alpha", "Beta", "Gamma", "Delta"],
  },
} as Meta<typeof FormMultipleInputFieldStoryWrapper>

type Story = StoryObj<typeof FormMultipleInputFieldStoryWrapper>

export const Basic: Story = {}

export const FocusShowsSuggestions: Story = {
  play: playMultipleFocusShowsSuggestions,
}

export const SuggestionsStayVisibleAfterFocus: Story = {
  play: playMultipleSuggestionsStayVisibleAfterFocus,
}

export const TypingFiltersSuggestions: Story = {
  play: playMultipleTypingFiltersSuggestions,
}

export const TypingKeepsSuggestionsVisible: Story = {
  play: playMultipleTypingKeepsSuggestionsVisible,
}

export const SelectSuggestionUpdatesInput: Story = {
  play: playMultipleSelectSuggestionUpdatesInput,
}

export const SelectSuggestionClosesSuggestionsAndUpdatesInput: Story = {
  play: playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput,
}

export const OutsideClickClosesSuggestions: Story = {
  play: playMultipleOutsideClickClosesSuggestions,
}

export const BackdropPressClosesSuggestions: Story = {
  play: playMultipleBackdropPressClosesSuggestions,
}
