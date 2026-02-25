import { BookDetailFieldList, BookDetailMenu, BookImageItem, RootContainer } from "@/components"
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
    handleFieldPress,
  } = useBookDetail()

  return (
    <RootContainer alignItems="center">
      <BookImageItem source={imageUrl} />
      <BookDetailMenu
        onOpenBook={handleOpenBook}
        onDownloadBook={handleDownloadBook}
        onConvertBook={handleConvertBook}
        onEditBook={handleEditBook}
        onDeleteBook={handleDeleteBook}
      />
      <BookDetailFieldList
        book={selectedBook}
        fieldMetadataList={selectedLibrary.fieldMetadataList}
        fieldNameList={selectedLibrary.bookDisplayFields}
        onFieldPress={handleFieldPress}
        marginTop={"$3"}
      />
    </RootContainer>
  )
})
