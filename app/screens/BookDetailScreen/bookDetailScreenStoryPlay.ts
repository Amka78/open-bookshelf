import { userEvent, within } from "@storybook/testing-library"

async function clickByTestId(canvasElement: HTMLElement, testId: string) {
  const canvas = within(canvasElement)
  const button = await canvas.findByTestId(testId)

  await userEvent.click(button)
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
