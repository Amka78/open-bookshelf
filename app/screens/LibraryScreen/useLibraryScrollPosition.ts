import { useCallback, useEffect, useRef } from "react"
import { getLibraryScrollOffset, setLibraryScrollOffset } from "./libraryScrollState"

type UseLibraryScrollPositionProps = {
  libraryId: string | null | undefined
  isFocused: boolean
  onRestoreOffset: (offset: number) => void
}

export function useLibraryScrollPosition({
  libraryId,
  isFocused,
  onRestoreOffset,
}: UseLibraryScrollPositionProps) {
  const shouldRestoreRef = useRef(false)
  const lastRestoredOffsetRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isFocused || !libraryId) {
      return
    }

    shouldRestoreRef.current = getLibraryScrollOffset(libraryId) > 0
    lastRestoredOffsetRef.current = null
  }, [isFocused, libraryId])

  const rememberScrollOffset = useCallback(
    (offset: number) => {
      setLibraryScrollOffset(libraryId, offset)
    },
    [libraryId],
  )

  const restoreScrollOffset = useCallback(() => {
    if (!isFocused || !libraryId || !shouldRestoreRef.current) {
      return false
    }

    const offset = getLibraryScrollOffset(libraryId)
    if (offset <= 0) {
      shouldRestoreRef.current = false
      return false
    }

    if (lastRestoredOffsetRef.current === offset) {
      return false
    }

    onRestoreOffset(offset)
    lastRestoredOffsetRef.current = offset
    shouldRestoreRef.current = false
    return true
  }, [isFocused, libraryId, onRestoreOffset])

  return {
    rememberScrollOffset,
    restoreScrollOffset,
  }
}
