import { findByPlaceholderText, findByTestId, findByText, fireEvent } from "@testing-library/react"

export async function playLibraryShowsSearchInput({
  canvasElement,
  placeholder,
}: {
  canvasElement: HTMLElement
  placeholder: string
}) {
  await findByPlaceholderText(canvasElement, placeholder)
}

export async function playLibrarySearchesByQuery({
  canvasElement,
  placeholder,
  query,
}: {
  canvasElement: HTMLElement
  placeholder: string
  query: string
}) {
  const input = await findByPlaceholderText(canvasElement, placeholder)
  fireEvent.change(input, { target: { value: query } })
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" })
}

export async function playLibraryChangesListStyle({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findByText(canvasElement, "Change View")
  fireEvent.click(button)
}

export async function playLibraryChangesSort({
  canvasElement,
  option,
}: {
  canvasElement: HTMLElement
  option: string
}) {
  const select = await findByTestId(canvasElement, "library-sort")
  fireEvent.change(select, { target: { value: option } })
}

export async function playLibraryOpensBook({
  canvasElement,
  title,
}: {
  canvasElement: HTMLElement
  title: string
}) {
  const item = await findByText(canvasElement, title)
  fireEvent.click(item)
}

export async function playLibraryShowsDescriptionItem({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "library-description-item")
}

export async function playLibraryShowsGridItem({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "library-grid-item")
}

export async function playLibraryTogglesSelectAllVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const button = await findByTestId(canvasElement, "selection-action-bar-toggle-visible")
  fireEvent.click(button)
}

export async function playLibraryRestoresScrollPosition({
  canvasElement,
  scrollTop,
}: {
  canvasElement: HTMLElement
  scrollTop: number
}) {
  const scrollRegion = await findByTestId(canvasElement, "library-scroll-region")
  const saveButton = await findByTestId(canvasElement, "library-save-scroll")
  const restoreButton = await findByTestId(canvasElement, "library-restore-scroll")

  scrollRegion.scrollTop = scrollTop
  fireEvent.click(saveButton)
  scrollRegion.scrollTop = 0
  fireEvent.click(restoreButton)
}
