import { Button, RootContainer, FormImageUploader, BookEditFieldList, VStack } from "@/components"
import type { Book } from "@/models/CalibreRootStore"
import type { FieldMetadataMap, Metadata } from "@/models/calibre"
import { useForm } from "react-hook-form"
export type BookEditScreenProps = {
  book: Book
  fieldMetadataList: FieldMetadataMap
  imageUrl: string
  onSubmitPress: (data: Metadata) => void
}
export function BookEditScreen(props: BookEditScreenProps) {
  const form = useForm<Metadata, unknown, Metadata>()
  return (
    <RootContainer alignItems="center">
      <VStack justifyContent="flex-start" flex={1}>
        <FormImageUploader control={form.control} name={"image"} defaultValue={props.imageUrl} />
        <BookEditFieldList
          book={props.book}
          control={form.control}
          fieldMetadataList={props.fieldMetadataList}
          marginTop={"$3"}
        />
      </VStack>
      <VStack justifyContent={"flex-end"} flex={1}>
        <Button
          tx={"bookEditScreen.save"}
          onPress={form.handleSubmit((value) => {
            if (props.onSubmitPress) {
              props.onSubmitPress(value)
            }
          })}
        />
      </VStack>
    </RootContainer>
  )
}
