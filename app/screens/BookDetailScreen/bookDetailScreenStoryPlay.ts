async function clickByTestId(canvasElement: HTMLElement, testId: string) {
  const button = canvasElement.querySelector(`[data-testid="${testId}"]`)
  if (!button || typeof (button as { click?: unknown }).click !== "function") {
    throw new Error(`Element with data-testid='${testId}' was not found.`)
  }
  ;(button as unknown as { click: () => void }).click()
}

export async function playBookDetailOpenAction({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await clickByTestId(canvasElement, "book-detail-open-button")
}

export async function playBookDetailDownloadAction({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await clickByTestId(canvasElement, "book-detail-download-button")
}

export async function playBookDetailConvertNavigation({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await clickByTestId(canvasElement, "book-detail-convert-button")
}

export async function playBookDetailEditNavigation({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await clickByTestId(canvasElement, "book-detail-edit-button")
}

export async function playBookDetailDeleteAction({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await clickByTestId(canvasElement, "book-detail-delete-button")
}
