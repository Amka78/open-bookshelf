import { textBookViewerPaginationMessageType } from "./textBookHtml"

export const STORY_SPINE_KEY = "story-spine-1"

async function waitForIframe(canvasElement: HTMLElement): Promise<HTMLElement | null> {
  for (let retry = 0; retry < 20; retry++) {
    const el = canvasElement.querySelector(
      `iframe[title="text-book-spine-${STORY_SPINE_KEY}"]`,
    ) as HTMLElement | null
    if (el) {
      return el
    }
    await new Promise((r) => setTimeout(r, 20))
  }
  return null
}

/**
 * Simulates the pagination notification that the spine iframe content script sends
 * after layout, and waits for the React event handler to process it.
 * In Storybook this is triggered after the story mounts; in unit tests it verifies
 * that onPaginationChange is called with the correct currentPage/totalPages.
 */
export async function playPaginationReported({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await waitForIframe(canvasElement)

  window.postMessage(
    JSON.stringify({
      type: textBookViewerPaginationMessageType,
      key: STORY_SPINE_KEY,
      currentPage: 0,
      totalPages: 3,
    }),
    "*",
  )

  await new Promise((r) => setTimeout(r, 30))
}

/**
 * Simulates a page-forward navigation command and the resulting pagination notification.
 * Verifies that onPaginationChange is called with currentPage: 1.
 */
export async function playNavigateToSecondPage({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  await waitForIframe(canvasElement)

  window.postMessage(
    JSON.stringify({
      type: textBookViewerPaginationMessageType,
      key: STORY_SPINE_KEY,
      currentPage: 1,
      totalPages: 3,
    }),
    "*",
  )

  await new Promise((r) => setTimeout(r, 30))
}
