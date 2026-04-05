import { useStores } from "@/models"

export function useSeriesNavigation() {
  const { calibreRootStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary?.selectedBook

  const seriesBooks = selectedBook ? selectedLibrary.seriesBooksFor(selectedBook.id) : []

  const currentIndex = seriesBooks.findIndex((b) => b.id === selectedBook?.id)
  const prevBook = currentIndex > 0 ? seriesBooks[currentIndex - 1] : null
  const nextBook =
    currentIndex >= 0 && currentIndex < seriesBooks.length - 1
      ? seriesBooks[currentIndex + 1]
      : null

  const navigateTo = (bookId: number) => {
    selectedLibrary?.setBook(bookId)
  }

  return {
    seriesBooks,
    currentIndex,
    prevBook,
    nextBook,
    navigateTo,
    hasSeries: seriesBooks.length > 1,
    seriesName: selectedBook?.metaData?.series ?? null,
  }
}
