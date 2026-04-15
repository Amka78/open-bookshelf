import { fireEvent } from "@testing-library/react"

function findInputByPlaceholder(canvasElement: HTMLElement, placeholder: string): HTMLInputElement {
  const input = canvasElement.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement | null

  if (!input) {
    throw new Error(`Input with placeholder '${placeholder}' was not found.`)
  }

  return input
}

export async function playShowsPlaceholder({
  canvasElement,
  placeholder,
}: {
  canvasElement: HTMLElement
  placeholder: string
}) {
  findInputByPlaceholder(canvasElement, placeholder)
}

export async function playTypingUpdatesInput({
  canvasElement,
  placeholder,
  value,
}: {
  canvasElement: HTMLElement
  placeholder: string
  value: string
}) {
  const input = findInputByPlaceholder(canvasElement, placeholder)

  fireEvent.change(input, { target: { value } })

  if (input.value !== value) {
    throw new Error(`Expected input value to be '${value}'.`)
  }
}
