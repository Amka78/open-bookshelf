import { BookDetailFieldList, BookDetailMenu, BookFormatList, BookImageItem, RootContainer, SeriesNavigationBar } from "@/components"
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
    handleSendByEmail,
    handleFieldPress,
    readStatus,
    handleSetStatus,
    handleDownloadFormat,
    handleDeleteFormat,
    handleUploadFormat,
  } = useBookDetail()

  const { hasSeries, prevBook, nextBook, currentIndex, seriesBooks, seriesName, navigateTo } =
    useSeriesNavigation()

  return (
    <RootContainer alignItems="center">
      <BookImageItem source={imageUrl} readStatus={readStatus} />
      <BookDetailMenu
        onOpenBook={handleOpenBook}
        onDownloadBook={handleDownloadBook}
        onConvertBook={handleConvertBook}
        onEditBook={handleEditBook}
        onDeleteBook={handleDeleteBook}
        onShareLink={handleShareLink}
        onSendByEmail={handleSendByEmail}
        readStatus={readStatus ?? null}
        onSetStatus={handleSetStatus}
      />
      <BookDetailFieldList
        book={selectedBook}
        fieldMetadataList={selectedLibrary.fieldMetadataList}
        fieldNameList={selectedLibrary.bookDisplayFields}
        onFieldPress={handleFieldPress}
        marginTop={"$3"}
      />
      <BookFormatList
        formats={selectedBook?.metaData?.formats ?? []}
        onDownload={handleDownloadFormat}
        onDelete={handleDeleteFormat}
        onUpload={handleUploadFormat}
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
