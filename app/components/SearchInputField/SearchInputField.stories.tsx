import { fireEvent } from "@testing-library/react"
import { Box } from "@/components/Box/Box"
import { Pressable } from "@/components/Pressable/Pressable"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { SearchInputField } from "./SearchInputField"

import { withComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import {
  findByTestId as findInDom,
  waitForAbsence as waitGoneInDom,
} from "../../../.storybook/stories/storyPlayDom"

const RETRY = { retries: 30, intervalMs: 100 }

const findByTestId = (canvasElement: HTMLElement, testId: string) =>
  findInDom(canvasElement, testId, RETRY)

const waitForAbsence = (canvasElement: HTMLElement, testId: string) =>
  waitGoneInDom(canvasElement, testId, RETRY)

function typeInput(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

function expectInputValue(input: HTMLElement, value: string) {
  if ((input as HTMLInputElement).value !== value) {
    throw new Error(`Expected input value to be '${value}'.`)
  }
}

async function playFocusShowsSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  fireEvent.focus(input)
  typeInput(input, "a")

  await findByTestId(canvasElement, "search-input-suggestion-authors%3A%3D")
}

async function playTypingKeepsSuggestionsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  fireEvent.focus(input)

  // Type a character that matches suggestions
  typeInput(input, "t")
  await findByTestId(canvasElement, "search-input-suggestion-title%3A%3D")

  // Wait 1 second - suggestions should STILL be visible (this is the bug fix verification)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await findByTestId(canvasElement, "search-input-suggestion-title%3A%3D")

  // Type another character
  typeInput(input, "ti")
  await findByTestId(canvasElement, "search-input-suggestion-title%3A%3D")

  // Wait another 1 second - suggestions should still be visible
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await findByTestId(canvasElement, "search-input-suggestion-title%3A%3D")
}

async function playTypingFiltersSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  fireEvent.focus(input)

  // Type "au" - should match author:=
  typeInput(input, "au")
  await findByTestId(canvasElement, "search-input-suggestion-authors%3A%3D")
}

async function playSelectSuggestionClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  fireEvent.focus(input)
  typeInput(input, "a")

  const candidate = await findByTestId(canvasElement, "search-input-suggestion-authors%3A%3D")
  fireEvent.click(candidate)

  // Suggestions should close
  await waitForAbsence(canvasElement, "search-input-suggestion-authors%3A%3D")
}

async function playBlurClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  fireEvent.focus(input)
  typeInput(input, "a")
  await findByTestId(canvasElement, "search-input-suggestion-authors%3A%3D")

  fireEvent.blur(input)

  await waitForAbsence(canvasElement, "search-input-suggestion-authors%3A%3D")
}

async function playBackspaceRemovesText({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  fireEvent.focus(input)

  // Type "authors:="
  typeInput(input, "authors:=")
  await findByTestId(canvasElement, "search-input-suggestion-authors%3A%3D")

  // Verify the value is "authors:="
  expectInputValue(input, "authors:=")

  // Simulate backspace - remove "="
  typeInput(input, "authors:")
  expectInputValue(input, "authors:")

  // Simulate another backspace - remove ":"
  typeInput(input, "authors")
  expectInputValue(input, "authors")

  // Simulate another backspace - remove "s"
  typeInput(input, "author")
  expectInputValue(input, "author")
}

async function playSaveButtonHidesLabel({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const saveButton = await findByTestId(canvasElement, "search-input-save-button")
  if (saveButton.getAttribute("data-label-tx")) {
    throw new Error("Expected the save button label to be hidden.")
  }
}

export function SearchInputFieldStoryWrapper({
  enableSaveButton = false,
  initialValue = "",
  showSaveLabel = true,
}: {
  enableSaveButton?: boolean
  initialValue?: string
  showSaveLabel?: boolean
}) {
  const [value, setValue] = useState(initialValue)

  const suggestions = ["title:=", "authors:=", "series:=", "tag:=", "AND", "OR", "NOT"]

  return (
    <Box width="$full" padding="$4">
      <SearchInputField
        value={value}
        onChangeText={setValue}
        suggestions={suggestions}
        width="$full"
        testID="search-input-story"
        placeholder="Type to see suggestions..."
        onSaveSearch={enableSaveButton ? () => {} : undefined}
        showSaveLabel={showSaveLabel}
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
  decorators: [withComponentHolder],
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

export const BlurClosesSuggestions: Story = {
  play: playBlurClosesSuggestions,
}

export const BackspaceRemovesText: Story = {
  play: playBackspaceRemovesText,
}

export const SaveButtonHidesLabel: Story = {
  render: () => (
    <SearchInputFieldStoryWrapper
      enableSaveButton={true}
      initialValue="Dune"
      showSaveLabel={false}
    />
  ),
  play: playSaveButtonHidesLabel,
}
