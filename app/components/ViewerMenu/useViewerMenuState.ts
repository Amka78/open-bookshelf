import type { BookReadingStyleType } from "@/type/types"
import { useState } from "react"

type UseViewerMenuStateParams = {
  pageDirection: "left" | "right"
  readingStyle: BookReadingStyleType
  onSelectReadingStyle: (readingStyle: BookReadingStyleType) => void
  onSelectPageDirection: (pageDirection: "left" | "right") => void
}

type UseViewerMenuStateResult = {
  pageDirectionState: "left" | "right"
  readingStyleState: BookReadingStyleType
  onUpdateReadingStyle: (readingStyle: BookReadingStyleType) => void
  onTogglePageDirection: () => "left" | "right"
}

export function useViewerMenuState({
  pageDirection,
  readingStyle,
  onSelectReadingStyle,
  onSelectPageDirection,
}: UseViewerMenuStateParams): UseViewerMenuStateResult {
  const [pageDirectionState, setPageDirectionState] = useState(pageDirection)
  const [readingStyleState, setReadingStyleState] = useState(readingStyle)

  const onUpdateReadingStyle = (nextReadingStyle: BookReadingStyleType) => {
    onSelectReadingStyle(nextReadingStyle)
    setReadingStyleState(nextReadingStyle)
  }

  const onTogglePageDirection = () => {
    const direction = pageDirectionState === "left" ? "right" : "left"
    onSelectPageDirection(direction)
    setPageDirectionState(direction)
    return direction
  }

  return {
    pageDirectionState,
    readingStyleState,
    onUpdateReadingStyle,
    onTogglePageDirection,
  }
}
