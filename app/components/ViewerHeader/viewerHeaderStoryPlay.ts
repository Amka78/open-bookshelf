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

export async function playViewerHeaderShowsTitleAndActions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await findByTestId(canvasElement, "viewer-header-title")
  await findByTestId(canvasElement, "viewer-display-settings-trigger")
}
