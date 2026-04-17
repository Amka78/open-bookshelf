import { act } from "@testing-library/react"

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

async function waitForRowCount(
  canvasElement: HTMLElement,
  baseTestId: string,
  expectedCount: number,
): Promise<void> {
  for (let retry = 0; retry < 20; retry += 1) {
    const count = canvasElement.querySelectorAll(`[data-testid^="${baseTestId}-format-"]`).length
    if (count === expectedCount) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  const current = canvasElement.querySelectorAll(`[data-testid^="${baseTestId}-format-"]`).length
  throw new Error(`Expected row count ${expectedCount}, but got ${current}.`)
}

export async function playClickFormatTriggersUpload({
  canvasElement,
  baseTestId,
}: {
  canvasElement: HTMLElement
  baseTestId: string
}) {
  const formatButton = await findByTestId(canvasElement, `${baseTestId}-format-0`)
  await act(async () => {
    formatButton.click()
  })
}

export async function playClickDisplayedFormatTextTriggersUpload({
  canvasElement,
  displayedFormat,
}: {
  canvasElement: HTMLElement
  displayedFormat: string
}) {
  for (let retry = 0; retry < 15; retry += 1) {
    const clickable = Array.from(canvasElement.querySelectorAll("button")).find((element) => {
      return element.textContent?.trim() === displayedFormat
    }) as HTMLElement | undefined

    if (clickable) {
      await act(async () => {
        clickable.click()
      })
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Clickable format text '${displayedFormat}' was not found.`)
}

export async function playPlusUploadsAndAddsRow({
  canvasElement,
  baseTestId,
}: {
  canvasElement: HTMLElement
  baseTestId: string
}) {
  await waitForRowCount(canvasElement, baseTestId, 2)

  const plusButton = await findByTestId(canvasElement, `${baseTestId}-plus-0`)
  await act(async () => {
    plusButton.click()
  })

  await waitForRowCount(canvasElement, baseTestId, 3)
}

export async function playMinusDeletesFormatRow({
  canvasElement,
  baseTestId,
}: {
  canvasElement: HTMLElement
  baseTestId: string
}) {
  await waitForRowCount(canvasElement, baseTestId, 2)

  const minusButton = await findByTestId(canvasElement, `${baseTestId}-minus-1`)
  await act(async () => {
    minusButton.click()
  })

  await waitForRowCount(canvasElement, baseTestId, 1)
}

export async function playSingleFormatHidesMinusButton({
  canvasElement,
  baseTestId,
}: {
  canvasElement: HTMLElement
  baseTestId: string
}) {
  await waitForRowCount(canvasElement, baseTestId, 1)

  const minusButton = canvasElement.querySelector(`[data-testid="${baseTestId}-minus-0"]`)
  if (minusButton) {
    throw new Error("Minus button should not be rendered when only one format exists.")
  }
}
