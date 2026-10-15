import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"
import { useMemo } from "react"

export type SeriesNavigationInfo = {
  seriesName: string
  currentIndex: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}

export type UseSeriesNavigationResult = {
  seriesInfo: SeriesNavigationInfo | null
  onPreviousBook: () => void
  onNextBook: () => void
}

export function useSeriesNavigation(): UseSeriesNavigationResult {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary?.selectedBook

  const seriesInfo = useMemo<SeriesNavigationInfo | null>(() => {
    if (!selectedBook || !selectedLibrary) return null

    const series = selectedBook.metaData?.series
    if (!series) return null

    const seriesBooks = selectedLibrary.seriesBooksFor(selectedBook.id)
    if (seriesBooks.length <= 1) return null

    const currentIndex = seriesBooks.findIndex((b) => b.id === selectedBook.id)
    if (currentIndex < 0) return null

    return {
      seriesName: series,
      currentIndex,
      totalCount: seriesBooks.length,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < seriesBooks.length - 1,
    }
  }, [selectedBook, selectedLibrary])

  const navigateToBook = (bookId: number) => {
    if (!selectedLibrary) return

    const targetBook = selectedLibrary.books.get(bookId.toString())
    if (!targetBook) return

    const format =
      targetBook.metaData?.selectedFormat ?? targetBook.metaData?.formats[0] ?? "EPUB"

    navigation.navigate("Viewer", {
      request: {
        bookId: targetBook.id,
        libraryId: selectedLibrary.id,
        format,
      },
    })
  }

  const onPreviousBook = () => {
    if (!seriesInfo?.hasPrevious || !selectedLibrary || !selectedBook) return

    const seriesBooks = selectedLibrary.seriesBooksFor(selectedBook.id)
    const prevBook = seriesBooks[seriesInfo.currentIndex - 1]
    if (prevBook) {
      navigateToBook(prevBook.id)
    }
  }

  const onNextBook = () => {
    if (!seriesInfo?.hasNext || !selectedLibrary || !selectedBook) return

    const seriesBooks = selectedLibrary.seriesBooksFor(selectedBook.id)
    const nextBook = seriesBooks[seriesInfo.currentIndex + 1]
    if (nextBook) {
      navigateToBook(nextBook.id)
    }
  }

  return {
    seriesInfo,
    onPreviousBook,
    onNextBook,
  }
}
