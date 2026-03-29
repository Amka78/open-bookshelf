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

async function findByText(canvasElement: HTMLElement, text: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const candidates = Array.from(canvasElement.querySelectorAll("*")) as HTMLElement[]
    const found = candidates.find((element) => element.textContent?.includes(text))
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Element containing text '${text}' was not found.`)
}

export async function playBookConvertSelectsOutputFormat({
  canvasElement,
  format,
}: {
  canvasElement: HTMLElement
  format: string
}) {
  const button = await findByTestId(canvasElement, `format-button-${format}`)
  fireEvent.click(button)
}

export async function playBookConvertShowsFormatSelection({
  canvasElement,
  format,
}: {
  canvasElement: HTMLElement
  format: string
}) {
  await findByTestId(canvasElement, `format-button-${format}`)
}

export async function playBookConvertShowsSpinnerWhileConverting({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByText(canvasElement, "Converting...")
}

export async function playBookConvertShowsSuccessState({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "convert-success")
}

export async function playBookConvertShowsErrorState({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "convert-error")
}

export async function playBookConvertShowsAccordionSections({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "convert-accordion")
}
