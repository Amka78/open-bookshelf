import {
  BookEditFieldList,
  Button,
  FormImageUploader,
  IconButton,
  RootContainer,
  VStack,
} from "@/components"
import { useConvergence } from "@/hooks/useConvergence"
import type { Book, Category, FieldMetadataMap, Metadata } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { useForm } from "react-hook-form"
import { useLayoutEffect } from "react"
export type BookEditScreenProps = {
  book: Book
  fieldMetadataList: FieldMetadataMap
  tagBrowser: Category[]
  imageUrl: string
  onSubmitPress: (data: Metadata) => void
}
export function BookEditScreen(props: BookEditScreenProps) {
  const form = useForm<Metadata, unknown, Metadata>()
  const navigation = useNavigation<ApppNavigationProp>()
  const convergenceHook = useConvergence()

  const onSubmit = form.handleSubmit((value) => {
    if (props.onSubmitPress) {
      props.onSubmitPress(value)
    }
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: convergenceHook.isLarge
        ? undefined
        : () => <IconButton name="content-save" iconSize="md-" onPress={onSubmit} />,
    })
  }, [convergenceHook.isLarge, navigation, onSubmit])

  return (
    <RootContainer alignItems="center">
      <VStack justifyContent="flex-start" flex={1}>
        <FormImageUploader control={form.control} name={"cover"} defaultValue={props.imageUrl} />
        <BookEditFieldList
          book={props.book}
          control={form.control}
          fieldMetadataList={props.fieldMetadataList}
          tagBrowser={props.tagBrowser}
          marginTop={"$3"}
        />
      </VStack>
      {convergenceHook.isLarge ? (
        <VStack justifyContent={"flex-end"} flex={1}>
          <Button tx={"bookEditScreen.save"} onPress={onSubmit} />
        </VStack>
      ) : null}
    </RootContainer>
  )
}
