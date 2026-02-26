import type { BookReadingStyleType } from "@/type/types"
import { goToNextPage } from "@/utils/pageTurnning"
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react"

export type FacingPageType = { page1?: number; page2?: number }
export type PageStyles = Record<BookReadingStyleType, number[] | FacingPageType[]>
export type FlashListHandle = {
  scrollToIndex: (params: { index: number; animated?: boolean }) => void
}

type UseBookViewerStateParams = {
  totalPage: number
  initialPage?: number
  readingStyle: BookReadingStyleType
  onPageChange?: (page: number) => void
  onLastPage?: () => void
  initialAutoPageTurnIntervalMs: number
  flashListRef: RefObject<FlashListHandle>
}

type UseBookViewerStateResult = {
  pages?: PageStyles
  data: number[] | FacingPageType[]
  scrollIndex: number
  currentPage: number
  autoPageTurning: boolean
  setAutoPageTurning: (value: boolean | ((prev: boolean) => boolean)) => void
  autoPageTurnIntervalMs: number
  setAutoPageTurnIntervalMs: (value: number) => void
  onViewableItemsChanged: (info: {
    viewableItems: { index?: number | null; isViewable?: boolean }[]
  }) => void
  scrollToIndex: (index: number, animated?: boolean) => void
  getScrollIndexForPage: (page: number) => number
  getIndexForReadingStyleChange: (newReadingStyle: BookReadingStyleType) => number | undefined
}

const getSafeRaf = () => {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame
  }
  return (callback: FrameRequestCallback) => {
    return setTimeout(callback, 0) as unknown as number
  }
}

export const createPageStyles = (totalPage: number): PageStyles => {
  const singlePage: number[] = []
  const facingPage: FacingPageType[] = []
  const facingPageWithTitle: FacingPageType[] = []
  for (let index = 0; index < totalPage; index++) {
    singlePage.push(index)

    if (index === 0) {
      facingPageWithTitle.push({ page1: index })
      facingPage.push({ page1: index, page2: index + 1 })
    } else if (index % 2 === 0) {
      if (index < totalPage) {
        facingPage.push({
          page1: index,
          page2: index + 1 < totalPage ? index + 1 : undefined,
        })
      }
    } else {
      if (index < totalPage) {
        facingPageWithTitle.push({
          page1: index,
          page2: index + 1 < totalPage ? index + 1 : undefined,
        })
      }
    }
  }

  return {
    singlePage,
    facingPage,
    facingPageWithTitle,
    verticalScroll: singlePage,
  }
}

const isFacingPageStyle = (readingStyle: BookReadingStyleType) => {
  return readingStyle === "facingPage" || readingStyle === "facingPageWithTitle"
}

export function useBookViewerState({
  totalPage,
  initialPage,
  readingStyle,
  onPageChange,
  onLastPage,
  initialAutoPageTurnIntervalMs,
  flashListRef,
}: UseBookViewerStateParams): UseBookViewerStateResult {
  const [scrollIndex, setScrollIndex] = useState(0)
  const [pages, setPages] = useState<PageStyles>()
  const [autoPageTurning, setAutoPageTurning] = useState(false)
  const [autoPageTurnIntervalMs, setAutoPageTurnIntervalMs] = useState(
    initialAutoPageTurnIntervalMs,
  )
  const initialPageAppliedRef = useRef(false)
  const lastPageNotifiedKeyRef = useRef<string | undefined>(undefined)

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      setScrollIndex(index)
      flashListRef.current?.scrollToIndex({ index, animated })
    },
    [flashListRef],
  )

  const onAutoPageTurning = useCallback(() => {
    if (!pages) return
    const totalPages = pages[readingStyle].length
    if (totalPages <= 1) return

    setScrollIndex((prevIndex) => {
      const nextIndex = goToNextPage(prevIndex, totalPages, 1)
      flashListRef.current?.scrollToIndex({ index: nextIndex })
      return nextIndex
    })
  }, [pages, readingStyle, flashListRef])

  useEffect(() => {
    if (!autoPageTurning) {
      return () => {}
    }

    const intervalId = setInterval(() => {
      onAutoPageTurning()
    }, autoPageTurnIntervalMs)

    return () => {
      clearInterval(intervalId)
    }
  }, [autoPageTurning, autoPageTurnIntervalMs, onAutoPageTurning])

  useEffect(() => {
    setPages(createPageStyles(totalPage))
  }, [totalPage])

  useEffect(() => {
    if (initialPage !== undefined) {
      initialPageAppliedRef.current = false
    }
  }, [initialPage])

  useEffect(() => {
    if (!pages || initialPage === undefined || initialPageAppliedRef.current) {
      return
    }

    const clampedPage = Math.max(0, Math.min(initialPage, Math.max(totalPage - 1, 0)))

    let initialIndex = clampedPage
    if (isFacingPageStyle(readingStyle)) {
      const pageList = pages[readingStyle] as FacingPageType[]
      const foundIndex = pageList.findIndex((value) => {
        return value.page1 === clampedPage || value.page2 === clampedPage
      })
      initialIndex = foundIndex >= 0 ? foundIndex : 0
    }

    scrollToIndex(initialIndex, false)
    const raf = getSafeRaf()
    raf(() => {
      flashListRef.current?.scrollToIndex({ index: initialIndex, animated: false })
    })
    initialPageAppliedRef.current = true
  }, [pages, initialPage, totalPage, readingStyle, scrollToIndex, flashListRef])

  const data = useMemo(() => {
    if (!pages) return []
    return pages[readingStyle]
  }, [pages, readingStyle])

  const onViewableItemsChanged = useRef(
    (info: { viewableItems: { index?: number | null; isViewable?: boolean }[] }) => {
      const nextIndex = info.viewableItems
        .filter((item) => item.isViewable && item.index !== undefined && item.index !== null)
        .map((item) => item.index as number)
        .sort((a, b) => a - b)
        .pop()

      if (nextIndex === undefined || nextIndex === null) return
      setScrollIndex((prev) => (prev === nextIndex ? prev : nextIndex))
    },
  ).current

  const currentPage = useMemo(() => {
    if (!pages) return 0

    if (scrollIndex !== 0) {
      if (readingStyle === "singlePage" || readingStyle === "verticalScroll") {
        return scrollIndex
      }
      if (isFacingPageStyle(readingStyle)) {
        return (pages[readingStyle][scrollIndex] as FacingPageType).page1 ?? 0
      }
    }

    return 0
  }, [pages, scrollIndex, readingStyle])

  useEffect(() => {
    onPageChange?.(currentPage)
  }, [currentPage, onPageChange])

  useEffect(() => {
    if (!pages) return

    const totalPageCount = pages[readingStyle].length
    if (totalPageCount <= 0) return

    if (scrollIndex >= totalPageCount - 1) {
      const lastPageKey = `${readingStyle}:${scrollIndex}:${totalPageCount}`
      if (lastPageNotifiedKeyRef.current === lastPageKey) {
        return
      }

      lastPageNotifiedKeyRef.current = lastPageKey
      onLastPage?.()
      return
    }

    lastPageNotifiedKeyRef.current = undefined
  }, [pages, onLastPage, scrollIndex, readingStyle])

  const getScrollIndexForPage = useCallback(
    (page: number) => {
      if (!pages) return page

      if (isFacingPageStyle(readingStyle) && page !== 0) {
        const index = (pages[readingStyle] as FacingPageType[]).findIndex((value) => {
          return value.page1 === page || value.page2 === page
        })
        return index >= 0 ? index : 0
      }

      return page
    },
    [pages, readingStyle],
  )

  const getIndexForReadingStyleChange = useCallback(
    (newReadingStyle: BookReadingStyleType) => {
      if (!pages) return undefined
      if (newReadingStyle === readingStyle) return scrollIndex

      const isFacingCurrent = isFacingPageStyle(readingStyle)
      const isFacingNext = isFacingPageStyle(newReadingStyle)

      if (isFacingCurrent) {
        const currentPage = (pages[readingStyle][scrollIndex] as FacingPageType).page1 ?? 0

        if (!isFacingNext) {
          return currentPage
        }

        const nextIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
          return value.page1 === currentPage || value.page2 === currentPage
        })
        return nextIndex >= 0 ? nextIndex : 0
      }

      if (isFacingNext) {
        const nextIndex = (pages[newReadingStyle] as FacingPageType[]).findIndex((value) => {
          return value.page1 === scrollIndex || value.page2 === scrollIndex
        })
        return nextIndex >= 0 ? nextIndex : 0
      }

      return scrollIndex
    },
    [pages, readingStyle, scrollIndex],
  )

  return {
    pages,
    data,
    scrollIndex,
    currentPage,
    autoPageTurning,
    setAutoPageTurning,
    autoPageTurnIntervalMs,
    setAutoPageTurnIntervalMs,
    onViewableItemsChanged,
    scrollToIndex,
    getScrollIndexForPage,
    getIndexForReadingStyleChange,
  }
}
