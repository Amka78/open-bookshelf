import { fireEvent } from "@testing-library/react"

async function findByTestId(canvasElement: HTMLElement, testId: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 30; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (found) {
      return found
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error(`Element with data-testid='${testId}' was not found.`)
}

function typeInput(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

async function waitForAbsence(canvasElement: HTMLElement, testId: string): Promise<void> {
  for (let retry = 0; retry < 30; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (!found) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error(`Element with data-testid='${testId}' was expected to disappear.`)
}

function expectInputValue(input: HTMLElement, value: string) {
  if ((input as HTMLInputElement).value !== value) {
    throw new Error(`Expected input value to be '${value}'.`)
  }
}

/**
 * Verifies that suggestions appear when input is focused.
 */
export async function playFocusShowsSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  fireEvent.focus(input)
  typeInput(input, "a")

  await findByTestId(canvasElement, "search-input-suggestion-authors%3A%3D")
}

/**
 * KEY TEST: Verifies that suggestions stay visible while typing.
 * This is the main test for the bug where suggestions disappear immediately after appearing.
 */
export async function playTypingKeepsSuggestionsVisible({
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

/**
 * Verifies that suggestions filter correctly while typing.
 */
export async function playTypingFiltersSuggestions({
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

/**
 * Verifies that clicking a suggestion selects it and closes suggestions.
 */
export async function playSelectSuggestionClosesSuggestions({
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

export async function playBlurClosesSuggestions({
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

/**
 * KEY TEST: Verifies that backspace properly removes text.
 * This tests the bug where "authors:=" cannot be deleted with backspace.
 */
export async function playBackspaceRemovesText({
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
