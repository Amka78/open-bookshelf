import { fireEvent, findByText, within } from "@testing-library/react"

export async function playOPDSRootShowsEntries({
  canvasElement,
  entryTitles,
}: {
  canvasElement: HTMLElement
  entryTitles: string[]
}) {
  for (const title of entryTitles) {
    await findByText(canvasElement, title)
  }
}

export async function playOPDSRootPressesEntry({
  canvasElement,
  entryTitle,
}: {
  canvasElement: HTMLElement
  entryTitle: string
}) {
  const titleNode = await findByText(canvasElement, entryTitle)
  const item = titleNode.closest('[data-testid="opds-root-item"]')

  if (!item) {
    throw new Error(`Could not find list item for entry ${entryTitle}.`)
  }

  fireEvent.click(within(item).getByRole("button"))
}
