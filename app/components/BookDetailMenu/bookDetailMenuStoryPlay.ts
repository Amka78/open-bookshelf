import { act, fireEvent } from "@testing-library/react"

function findByTestId(canvasElement: HTMLElement, testId: string): HTMLElement {
  const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null

  if (!found) {
    throw new Error(`Element with data-testid='${testId}' was not found.`)
  }

  return found
}

export async function playBookDetailMenuEditDoesNotBubble({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await act(async () => {
    fireEvent.click(findByTestId(canvasElement, "book-detail-edit-button"))
  })
}
