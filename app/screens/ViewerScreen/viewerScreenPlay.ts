import { act } from "@testing-library/react"

export function createViewerScreenFrameScheduler() {
  let nextId = 1
  const callbacks = new Map<number, FrameRequestCallback>()

  return {
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = nextId
      nextId += 1
      callbacks.set(id, callback)
      return id
    },
    cancelAnimationFrame: (id: number) => {
      callbacks.delete(id)
    },
    flushFrame: () => {
      const next = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined
      if (!next) return false

      const [id, callback] = next
      callbacks.delete(id)
      callback(0)
      return true
    },
  }
}

export async function playViewerScreenResumePromptAppears({
  flushFrame,
}: {
  flushFrame: () => boolean
}) {
  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

export async function playViewerScreenResumePromptDoesNotReopenOnRerender({
  rerender,
  flushFrame,
}: {
  rerender: () => void
  flushFrame: () => boolean
}) {
  await playViewerScreenResumePromptAppears({ flushFrame })

  await act(async () => {
    rerender()
  })

  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

export async function playViewerScreenResumePromptAccepts({
  flushFrame,
  onAccept,
}: {
  flushFrame: () => boolean
  onAccept: () => void
}) {
  await playViewerScreenResumePromptAppears({ flushFrame })

  await act(async () => {
    onAccept()
  })
}

export async function playViewerScreenResumePromptDeclines({
  flushFrame,
  onDecline,
}: {
  flushFrame: () => boolean
  onDecline: () => void
}) {
  await playViewerScreenResumePromptAppears({ flushFrame })

  await act(async () => {
    onDecline()
  })
}
