import { fireEvent } from "@testing-library/react"

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

async function findButtonByText(canvasElement: HTMLElement, text: string): Promise<HTMLButtonElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const buttons = Array.from(canvasElement.querySelectorAll("button")) as HTMLButtonElement[]
    const found = buttons.find((button) => button.textContent?.includes(text))
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Button containing text '${text}' was not found.`)
}

export async function playKeyboardShownHidesCover({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "book-edit-screen-fields-container")

  const cover = canvasElement.querySelector(
    `[data-testid="book-edit-screen-cover-container"]`,
  ) as HTMLElement | null

  if (cover) {
    throw new Error("Cover container should be hidden while keyboard is visible.")
  }
}

export async function playKeyboardShownKeepsFieldsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const fields = await findByTestId(canvasElement, "book-edit-screen-fields-container")
  if (!fields) {
    throw new Error("Fields container should stay visible while keyboard is visible.")
  }

  const scroll = await findByTestId(canvasElement, "book-edit-screen-scroll")
  const bottomPadding = Number(scroll.getAttribute("data-padding-bottom") ?? "0")
  if (bottomPadding <= 0) {
    throw new Error("Scroll bottom padding should be applied while keyboard is visible.")
  }
}

export async function playFocusTriggersAutoScroll({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await findByTestId(canvasElement, "book-edit-focus-probe")
  fireEvent.focus(input)

  for (let retry = 0; retry < 15; retry += 1) {
    const scroll = await findByTestId(canvasElement, "book-edit-screen-scroll")
    const calls = Number(scroll.getAttribute("data-scroll-end-calls") ?? "0")
    if (calls > 0) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error("Expected auto-scroll to be triggered when input is focused.")
}

export async function playSmallScreenHeaderSaveButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findButtonByText(canvasElement, "Save")
}

export async function playLargeScreenShowsSaveButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findButtonByText(canvasElement, "Save")
}

export async function playSmallScreenHidesSaveButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const buttons = Array.from(canvasElement.querySelectorAll("button")) as HTMLButtonElement[]
  const found = buttons.find((button) => button.textContent?.includes("Save"))
  if (found) {
    throw new Error("Save button should be hidden on small screens.")
  }
}

export async function playPressingSaveTriggersSubmit({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findButtonByText(canvasElement, "Save")
  fireEvent.click(button)
}
