import { Box } from "@/components/Box/Box"
import { Pressable } from "@/components/Pressable/Pressable"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { SearchInputField } from "./SearchInputField"
import {
  playBackspaceRemovesText,
  playFocusShowsSuggestions,
  playSelectSuggestionClosesSuggestions,
  playTypingFiltersSuggestions,
  playTypingKeepsSuggestionsVisible,
} from "./SearchInputField.storyPlay"

export function SearchInputFieldStoryWrapper() {
  const [value, setValue] = useState("")

  const suggestions = ["title:=", "author:=", "series:=", "tag:=", "AND", "OR", "NOT"]

  return (
    <Box width="$full" padding="$4">
      <SearchInputField
        value={value}
        onChangeText={setValue}
        suggestions={suggestions}
        width="$full"
        testID="search-input-story"
        placeholder="Type to see suggestions..."
      />
      {/* Outside area to test blur behavior */}
      <Pressable testID="search-input-story-outside">
        <Box height="$20" backgroundColor="$secondary0" marginTop="$4" />
      </Pressable>
    </Box>
  )
}

export default {
  title: "SearchInputField",
  component: SearchInputFieldStoryWrapper,
} as Meta<typeof SearchInputFieldStoryWrapper>

type Story = StoryObj<typeof SearchInputFieldStoryWrapper>

export const Basic: Story = {}

export const FocusShowsSuggestions: Story = {
  play: playFocusShowsSuggestions,
}

export const TypingKeepsSuggestionsVisible: Story = {
  play: playTypingKeepsSuggestionsVisible,
}

export const TypingFiltersSuggestions: Story = {
  play: playTypingFiltersSuggestions,
}

export const SelectSuggestionClosesSuggestions: Story = {
  play: playSelectSuggestionClosesSuggestions,
}

export const BackspaceRemovesText: Story = {
  play: playBackspaceRemovesText,
}
