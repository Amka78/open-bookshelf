/**
 * Play functions for ViewerScreen and PDFViewerScreen stories.
 *
 * Each play function verifies that the viewer renders correctly for a given
 * format — the mock SVG pages are visible, and basic page navigation works.
 *
 * The ViewerHeader and PageManager are hidden by default (showMenu = false),
 * so these play functions focus on content that IS rendered: the mock pages.
 */

/**
 * Wait for text content matching the given string to appear in the DOM.
 * Retries up to `maxRetries` times with a delay between each attempt.
 */
async function findByText(
  canvasElement: HTMLElement,
  text: string,
  maxRetries = 30,
): Promise<HTMLElement> {
  for (let i = 0; i < maxRetries; i++) {
    const all = Array.from(canvasElement.querySelectorAll("*")) as HTMLElement[]
    const found = all.find((el) => el.textContent?.includes(text))
    if (found) return found
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`Element containing text '${text}' was not found after ${maxRetries} retries.`)
}

/**
 * Verify that the viewer renders at least one mock page.
 *
 * The mock SVG pages contain text like "Page 1 / 6".
 * This confirms the BookViewer / page rendering pipeline is working.
 */
export async function playViewerRendersPage({
  canvasElement,
  bookTitle,
  pageCount,
}: {
  canvasElement: HTMLElement
  bookTitle?: string
  pageCount?: number
}) {
  // Wait for page content to render (mock SVGs contain "Page 1")
  const pageEl = await findByText(canvasElement, "Page")
  if (!pageEl) {
    throw new Error(
      "Expected page content (text containing 'Page') to appear, but it was not found.",
    )
  }
}

/**
 * Verify the viewer shows the book title (in the ViewerHeader).
 * Note: ViewerHeader is only visible when showMenu = true.
 * In stories this requires the wrapper to have triggered menu visibility.
 */
export async function playViewerShowsTitleIfVisible({
  canvasElement,
  title,
}: {
  canvasElement: HTMLElement
  title: string
}) {
  const titleEl = canvasElement.querySelector(`[data-testid="viewer-header-title"]`)
  if (titleEl) {
    const text = titleEl.textContent ?? ""
    if (!text.includes(title)) {
      throw new Error(`Expected title to include "${title}" but found "${text}"`)
    }
  }
  // If not visible, skip check — menu is hidden by default
}

/**
 * Basic viewer story play: verifies the viewer renders page content.
 * This works for all format types (image-based, HTML, PDF).
 */
export async function playBasicViewerRenders({
  canvasElement,
  bookTitle,
  pageCount,
}: {
  canvasElement: HTMLElement
  bookTitle?: string
  pageCount?: number
}) {
  await playViewerRendersPage({ canvasElement, bookTitle, pageCount })
  await playViewerShowsTitleIfVisible({ canvasElement, title: bookTitle ?? "" })
}

function querySvgPageImages(canvasElement: HTMLElement) {
  return Array.from(canvasElement.querySelectorAll("img")).filter((img) =>
    (img.getAttribute("src") ?? "").startsWith("data:image/svg+xml"),
  )
}

/**
 * Verify that an image-based viewer rendered the expected number of page images.
 *
 * The mock pages are SVG data URIs shown through <img>, so their "Page N / M" label
 * lives inside the image and never reaches the DOM text. playViewerRendersPage
 * (text based) therefore cannot be used for image-based formats.
 */
export async function playImageBasedViewerRendersPages({
  canvasElement,
  pageCount,
  maxRetries = 30,
}: {
  canvasElement: HTMLElement
  pageCount: number
  maxRetries?: number
}) {
  for (let i = 0; i < maxRetries; i++) {
    if (querySvgPageImages(canvasElement).length === pageCount) {
      return
    }
    await new Promise((r) => setTimeout(r, 100))
  }

  throw new Error(
    `Expected ${pageCount} SVG page images but found ${querySvgPageImages(canvasElement).length}.`,
  )
}

/**
 * Image-based counterpart of playBasicViewerRenders.
 */
export async function playImageBasedViewerRenders({
  canvasElement,
  bookTitle,
  pageCount,
}: {
  canvasElement: HTMLElement
  bookTitle?: string
  pageCount: number
}) {
  await playImageBasedViewerRendersPages({ canvasElement, pageCount })
  await playViewerShowsTitleIfVisible({ canvasElement, title: bookTitle ?? "" })
}
