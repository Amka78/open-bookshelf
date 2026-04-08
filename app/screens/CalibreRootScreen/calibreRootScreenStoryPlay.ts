import { findByText, fireEvent, within } from "@testing-library/react"

export async function playCalibreRootShowsLibraryNames({
  canvasElement,
  libraryNames,
}: {
  canvasElement: HTMLElement
  libraryNames: string[]
}) {
  for (const libraryName of libraryNames) {
    await findByText(canvasElement, libraryName)
  }
}

export async function playCalibreRootPressesLibrary({
  canvasElement,
  libraryName,
}: {
  canvasElement: HTMLElement
  libraryName: string
}) {
  const row = await findByText(canvasElement, libraryName)
  const pressable = row.closest('[data-testid="calibre-root-item"]')

  if (!pressable) {
    throw new Error(`Could not find pressable item for library ${libraryName}.`)
  }

  fireEvent.click(within(pressable as HTMLElement).getByRole("button"))
}
