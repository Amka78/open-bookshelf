import { act } from "@testing-library/react"

export function createFrameScheduler() {
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
      const entry = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined
      if (!entry) return false

      const [id, callback] = entry
      callbacks.delete(id)
      callback(0)
      return true
    },
  }
}

export async function playResumeReadingPromptAppears({
  flushFrame,
}: {
  flushFrame: () => boolean
}) {
  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

export async function playResumeReadingPromptDoesNotReopenOnRerender({
  rerender,
  flushFrame,
}: {
  rerender: () => void
  flushFrame: () => boolean
}) {
  await playResumeReadingPromptAppears({ flushFrame })

  await act(async () => {
    rerender()
  })

  await act(async () => {
    flushFrame()
    flushFrame()
  })
}

export async function playResumeReadingPromptAccepts({
  flushFrame,
  onAccept,
}: {
  flushFrame: () => boolean
  onAccept: () => void
}) {
  await playResumeReadingPromptAppears({ flushFrame })

  await act(async () => {
    onAccept()
  })
}

export async function playResumeReadingPromptDeclines({
  flushFrame,
  onDecline,
}: {
  flushFrame: () => boolean
  onDecline: () => void
}) {
  await playResumeReadingPromptAppears({ flushFrame })

  await act(async () => {
    onDecline()
  })
}
