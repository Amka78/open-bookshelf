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

async function findByPlaceholder(
  canvasElement: HTMLElement,
  placeholder: string,
): Promise<HTMLInputElement> {
  for (let retry = 0; retry < 15; retry += 1) {
    const inputs = Array.from(canvasElement.querySelectorAll("input")) as HTMLInputElement[]
    const found = inputs.find((input) => input.placeholder === placeholder)
    if (found) {
      return found
    }

    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  throw new Error(`Input with placeholder '${placeholder}' was not found.`)
}

export async function playConnectShowsHeading({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "connect-heading")
}

export async function playConnectShowsButton({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "connect-button")
}

export async function playConnectShowsDefaultUrl({
  canvasElement,
  placeholder,
  expectedValue,
}: {
  canvasElement: HTMLElement
  placeholder: string
  expectedValue: string
}) {
  const input = await findByPlaceholder(canvasElement, placeholder)
  if (input.value !== expectedValue) {
    throw new Error(`Expected input value '${expectedValue}', but received '${input.value}'.`)
  }
}

export async function playConnectButtonIsDisabled({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findByTestId(canvasElement, "connect-button")
  if (!(button as HTMLButtonElement).disabled) {
    throw new Error("Connect button should be disabled.")
  }
}

export async function playConnectButtonTriggersSubmit({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findByTestId(canvasElement, "connect-button")
  fireEvent.click(button)
}
