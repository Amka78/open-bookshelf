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
  const htmlInput = input as HTMLInputElement
  const eventConstructor = htmlInput.ownerDocument.defaultView?.Event
  if (!eventConstructor) {
    throw new Error("Event constructor is unavailable.")
  }

  htmlInput.value = value
  htmlInput.dispatchEvent(new eventConstructor("input", { bubbles: true }))
  htmlInput.dispatchEvent(new eventConstructor("change", { bubbles: true }))
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

/**
 * Verifies that suggestions appear when input is focused.
 */
export async function playFocusShowsSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "search-input-story")
  input.focus()

  // Should show AND suggestion when input is empty
  await findByTestId(canvasElement, "search-input-suggestion-AND")
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
  input.focus()

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
  input.focus()

  // Type "au" - should match author:=
  typeInput(input, "au")
  await findByTestId(canvasElement, "search-input-suggestion-author%3A%3D")
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
  input.focus()

  const candidate = await findByTestId(canvasElement, "search-input-suggestion-AND")
  candidate.click()

  // Suggestions should close
  await waitForAbsence(canvasElement, "search-input-suggestion-AND")
}
