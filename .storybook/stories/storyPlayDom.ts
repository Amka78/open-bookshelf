const RETRY_COUNT = 15
const RETRY_INTERVAL_MS = 20

export type RetryOptions = {
  retries?: number
  intervalMs?: number
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// web の FormSuggestionPopover は createPortal で body 直下に描画されるため、
// canvasElement だけを走査すると候補が見つからない。canvas を優先し、無ければ body を探す。
export function queryByTestId(canvasElement: HTMLElement, testId: string): HTMLElement | null {
  const selector = `[data-testid="${testId}"]`
  return (
    (canvasElement.querySelector(selector) as HTMLElement | null) ??
    (document.body.querySelector(selector) as HTMLElement | null)
  )
}

export async function findByTestId(
  canvasElement: HTMLElement,
  testId: string,
  { retries = RETRY_COUNT, intervalMs = RETRY_INTERVAL_MS }: RetryOptions = {},
): Promise<HTMLElement> {
  for (let retry = 0; retry < retries; retry += 1) {
    const found = queryByTestId(canvasElement, testId)
    if (found) {
      return found
    }
    await sleep(intervalMs)
  }

  throw new Error(`Element with data-testid='${testId}' was not found.`)
}

export async function waitForAbsence(
  canvasElement: HTMLElement,
  testId: string,
  { retries = RETRY_COUNT, intervalMs = RETRY_INTERVAL_MS }: RetryOptions = {},
): Promise<void> {
  for (let retry = 0; retry < retries; retry += 1) {
    if (!queryByTestId(canvasElement, testId)) {
      return
    }
    await sleep(intervalMs)
  }

  throw new Error(`Element with data-testid='${testId}' was expected to disappear.`)
}

export function typeInput(input: HTMLElement, value: string) {
  const htmlInput = input as HTMLInputElement
  const win = htmlInput.ownerDocument.defaultView
  if (!win) {
    throw new Error("Window is unavailable.")
  }

  // React は value tracker で input.value への直接代入を無視するため、
  // prototype の native setter 経由でセットしてから input イベントを流す。
  const valueSetter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value")?.set
  if (!valueSetter) {
    throw new Error("HTMLInputElement value setter is unavailable.")
  }
  valueSetter.call(htmlInput, value)

  htmlInput.dispatchEvent(new win.Event("input", { bubbles: true }))
  htmlInput.dispatchEvent(new win.Event("change", { bubbles: true }))
}
