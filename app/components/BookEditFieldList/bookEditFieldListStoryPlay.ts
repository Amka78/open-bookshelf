import { fireEvent } from "@testing-library/react"

/** Click the Custom Fields tab */
export async function playCustomFieldsTab({
  canvasElement,
}: {
  canvasElement: HTMLElement
}): Promise<void> {
  const customTab = canvasElement.querySelector<HTMLElement>('[data-testid="book-edit-tab-custom"]')
  if (!customTab) throw new Error("Custom fields tab not found in canvas")
  fireEvent.click(customTab)
}
