async function findByTestId(canvasElement: HTMLElement, testId: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (found) {
      return found
    }
    await new Promise((resolve) => setTimeout(resolve, 20))
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
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Element with data-testid='${testId}' was expected to disappear.`)
}

export async function playFocusShowsSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  input.focus()

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")
}

export async function playSuggestionsStayVisibleAfterFocus({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  input.focus()

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")
  await new Promise((resolve) => setTimeout(resolve, 350))
  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")
}

export async function playTypingFiltersSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  input.focus()

  await findByTestId(canvasElement, "form-input-suggestion-title-Beta")
  typeInput(input, "ga")

  await findByTestId(canvasElement, "form-input-suggestion-title-Gamma")
  await waitForAbsence(canvasElement, "form-input-suggestion-title-Beta")
}

export async function playTypingKeepsSuggestionsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  input.focus()

  typeInput(input, "ga")
  await findByTestId(canvasElement, "form-input-suggestion-title-Gamma")

  await new Promise((resolve) => setTimeout(resolve, 300))
  await findByTestId(canvasElement, "form-input-suggestion-title-Gamma")
}

export async function playSelectSuggestionUpdatesInput({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await findByTestId(canvasElement, "form-input-story-input")) as HTMLInputElement
  input.focus()

  const candidate = await findByTestId(canvasElement, "form-input-suggestion-title-Beta")
  const mouseEventConstructor = input.ownerDocument.defaultView?.MouseEvent
  if (!mouseEventConstructor) {
    throw new Error("MouseEvent constructor is unavailable.")
  }

  candidate.dispatchEvent(new mouseEventConstructor("mousedown", { bubbles: true }))
  candidate.click()

  for (let retry = 0; retry < 15; retry += 1) {
    if (input.value === "Beta") {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Expected input value to be 'Beta', but got '${input.value}'.`)
}

export async function playSelectSuggestionClosesSuggestionsAndUpdatesInput({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await findByTestId(canvasElement, "form-input-story-input")) as HTMLInputElement
  input.focus()

  const candidateTestId = "form-input-suggestion-title-Beta"
  const candidate = await findByTestId(canvasElement, candidateTestId)
  candidate.click()

  for (let retry = 0; retry < 15; retry += 1) {
    if (input.value === "Beta") {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  if (input.value !== "Beta") {
    throw new Error(`Expected input value to be 'Beta', but got '${input.value}'.`)
  }

  await waitForAbsence(canvasElement, candidateTestId)
}

export async function playOutsideClickClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await findByTestId(canvasElement, "form-input-story-input")) as HTMLInputElement
  input.focus()

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")

  const outside = await findByTestId(canvasElement, "form-input-story-outside")
  const mouseEventConstructor = input.ownerDocument.defaultView?.MouseEvent
  if (!mouseEventConstructor) {
    throw new Error("MouseEvent constructor is unavailable.")
  }

  outside.dispatchEvent(new mouseEventConstructor("mousedown", { bubbles: true }))
  input.blur()
  outside.click()

  await waitForAbsence(canvasElement, "form-input-suggestion-title-Alpha")
}

export async function playBackdropPressClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "form-input-story-input")
  input.focus()

  await findByTestId(canvasElement, "form-input-suggestion-title-Alpha")

  const backdrop = await findByTestId(canvasElement, "form-input-backdrop-title")
  backdrop.click()

  await waitForAbsence(canvasElement, "form-input-suggestion-title-Alpha")
}
