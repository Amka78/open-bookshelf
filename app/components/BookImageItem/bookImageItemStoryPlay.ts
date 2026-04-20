import { act, fireEvent } from "@testing-library/react"

function findElementByTestId(canvasElement: HTMLElement, testId: string): HTMLElement {
  const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null

  if (!found) {
    throw new Error(`Element with data-testid='${testId}' was not found.`)
  }

  return found
}

export async function playBookImageItemSelectedSearchPressesAuthorLink({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  findElementByTestId(canvasElement, "book-image-hover-overlay")
  findElementByTestId(canvasElement, "book-image-hover-title-authors")
  findElementByTestId(canvasElement, "book-image-hover-title-series")
  findElementByTestId(canvasElement, "book-image-hover-title-tags")
  findElementByTestId(canvasElement, "book-image-hover-title-formats")

  await act(async () => {
    fireEvent.click(
      findElementByTestId(canvasElement, "book-image-hover-link-authors-Ursula K. Le Guin"),
    )
  })
}

export async function playBookImageItemEditButtonDoesNotTriggerParentPress({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await act(async () => {
    fireEvent.click(findElementByTestId(canvasElement, "book-detail-edit-button"))
  })
}

export async function playBookImageItemShowsDetailMenuWhenSelected({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  findElementByTestId(canvasElement, "book-image-detail-menu-overlay")
}
