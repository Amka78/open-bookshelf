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

/**
 * Verifies the reset button is visible in the error screen.
 */
export async function playResetButtonIsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findByTestId(canvasElement, "error-reset-button")
  if (!button) {
    throw new Error("Reset button (error-reset-button) should be visible in the error screen.")
  }
}

/**
 * Verifies that a flex:1 scroll wrapper exists so the button cannot be pushed off-screen.
 */
export async function playScrollWrapperIsPresent({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "error-details-scroll-wrapper")
}

/**
 * Presses the reset button and waits a tick.
 * The test is responsible for asserting that the onReset callback was invoked.
 */
export async function playPressResetButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findByTestId(canvasElement, "error-reset-button")
  fireEvent.click(button)
  await new Promise((resolve) => setTimeout(resolve, 50))
}
