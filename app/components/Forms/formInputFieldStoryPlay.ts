import { act } from "@testing-library/react"

import { findByTestId, typeInput, waitForAbsence } from "../../../.storybook/stories/storyPlayDom"

export async function playFocusShowsSuggestions({
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

export async function playSuggestionsStayVisibleAfterFocus({
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

export async function playTypingFiltersSuggestions({
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

export async function playTypingKeepsSuggestionsVisible({
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

export async function playSelectSuggestionUpdatesInput({
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

export async function playSelectSuggestionClosesSuggestionsAndUpdatesInput({
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

export async function playOutsideClickClosesSuggestions({
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

export async function playBackdropPressClosesSuggestions({
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
