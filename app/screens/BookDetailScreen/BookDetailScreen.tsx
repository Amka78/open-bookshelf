import { BookDetailFieldList, BookDetailMenu, BookImageItem, RootContainer, SeriesNavigationBar } from "@/components"
import { useSeriesNavigation } from "@/hooks/useSeriesNavigation"
import { useBookDetail } from "@/screens/BookDetailScreen/useBookDetail"
import { observer } from "mobx-react-lite"
import type { FC } from "react"

export const BookDetailScreen: FC = observer(() => {
  const {
    selectedLibrary,
    selectedBook,
    imageUrl,
    handleOpenBook,
    handleDownloadBook,
    handleConvertBook,
    handleEditBook,
    handleDeleteBook,
    handleShareLink,
    handleFieldPress,
  } = useBookDetail()

  const { hasSeries, prevBook, nextBook, currentIndex, seriesBooks, seriesName, navigateTo } =
    useSeriesNavigation()

  return (
    <RootContainer alignItems="center">
      <BookImageItem source={imageUrl} />
      <BookDetailMenu
        onOpenBook={handleOpenBook}
        onDownloadBook={handleDownloadBook}
        onConvertBook={handleConvertBook}
        onEditBook={handleEditBook}
        onDeleteBook={handleDeleteBook}
        onShareLink={handleShareLink}
      />
      <BookDetailFieldList
        book={selectedBook}
        fieldMetadataList={selectedLibrary.fieldMetadataList}
        fieldNameList={selectedLibrary.bookDisplayFields}
        onFieldPress={handleFieldPress}
        marginTop={"$3"}
      />
      {hasSeries ? (
        <SeriesNavigationBar
          prevBook={prevBook}
          nextBook={nextBook}
          currentIndex={currentIndex}
          totalCount={seriesBooks.length}
          seriesName={seriesName}
          onPrev={() => prevBook && navigateTo(prevBook.id)}
          onNext={() => nextBook && navigateTo(nextBook.id)}
        />
      ) : null}
    </RootContainer>
  )
})
