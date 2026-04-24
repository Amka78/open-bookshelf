import { act } from "@testing-library/react"

async function findByTestId(canvasElement: HTMLElement, testId: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (found) {
      return found
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 20)
    })
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
  for (let retry = 0; retry < 15; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (!found) {
      return
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 20)
    })
  }

  throw new Error(`Element with data-testid='${testId}' was expected to disappear.`)
}

export async function playMultipleFocusShowsSuggestions({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = await findByTestId(canvasElement, "form-multiple-input-story-row-0")
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")
}

export async function playMultipleSuggestionsStayVisibleAfterFocus({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-multiple-input-story-row-0")
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")
  await new Promise((resolve) => {
    setTimeout(resolve, 350)
  })
  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")
}

export async function playMultipleTypingFiltersSuggestions({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = await findByTestId(canvasElement, "form-multiple-input-story-row-0")
  await act(async () => {
    input.focus()
  })
  await act(async () => {
    typeInput(input, "ga")
  })

  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Gamma")
  await waitForAbsence(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")
}

export async function playMultipleTypingKeepsSuggestionsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-multiple-input-story-row-0")
  await act(async () => {
    input.focus()
  })
  await act(async () => {
    typeInput(input, "ga")
  })

  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Gamma")
  await new Promise((resolve) => {
    setTimeout(resolve, 300)
  })
  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Gamma")
}

export async function playMultipleSelectSuggestionUpdatesInput({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = (await findByTestId(
    canvasElement,
    "form-multiple-input-story-row-0",
  )) as HTMLInputElement
  await act(async () => {
    input.focus()
  })

  const candidate = await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Beta")
  await act(async () => {
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

export async function playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await findByTestId(
    canvasElement,
    "form-multiple-input-story-row-0",
  )) as HTMLInputElement
  await act(async () => {
    input.focus()
  })

  const candidateTestId = "form-multiple-input-tags-0-suggestion-Beta"
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

export async function playMultipleOutsideClickClosesSuggestions({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = (await findByTestId(
    canvasElement,
    "form-multiple-input-story-row-0",
  )) as HTMLInputElement
  await act(async () => {
    input.focus()
  })
  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")

  const outside = await findByTestId(canvasElement, "form-multiple-input-story-outside")
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

  await waitForAbsence(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")
}

export async function playMultipleBackdropPressClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-multiple-input-story-row-0")
  await act(async () => {
    input.focus()
  })

  await findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")

  const backdrop = await findByTestId(canvasElement, "form-multiple-input-tags-0-backdrop")
  await act(async () => {
    backdrop.click()
    // Wait for any scheduled state updates to settle
    await new Promise((resolve) => {
      setTimeout(resolve, 50)
    })
  })

  await waitForAbsence(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha")
}
