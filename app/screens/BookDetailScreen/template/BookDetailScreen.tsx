import { BookDetailFieldList, BookDetailMenu, BookImageItem, RootContainer } from "@/components"
import type { Book } from "@/models/CalibreRootStore"
import type { FieldMetadataMap } from "@/models/calibre"
export type BookDetailScreenProps = {
  book: Book
  fieldMetadataList: FieldMetadataMap
  fieldNameList: Array<string>
  imageUrl: string
  onOpenBook: () => Promise<void>
  onDownloadBook: () => void
  onConvertBook: () => void
  onEditBook: () => void
  onDeleteBook: () => void
  onFieldPress: (query: string) => void
}
export function BookDetailScreen(props: BookDetailScreenProps) {
  return (
    <RootContainer alignItems="center">
      <BookImageItem source={props.imageUrl} />
      <BookDetailMenu
        onOpenBook={props.onOpenBook}
        onDownloadBook={props.onDownloadBook}
        onConvertBook={props.onConvertBook}
        onEditBook={props.onEditBook}
        onDeleteBook={props.onDeleteBook}
      />
      <BookDetailFieldList
        book={props.book}
        fieldMetadataList={props.fieldMetadataList}
        fieldNameList={props.fieldNameList}
        onFieldPress={props.onFieldPress}
        marginTop={"$3"}
      />
    </RootContainer>
  )
}
