import {
  BookEditFieldList,
  Button,
  FormImageUploader,
  IconButton,
  RootContainer,
  VStack,
} from "@/components"
import type { ModalStackParams } from "@/components/Modals/Types"
import { useConvergence } from "@/hooks/useConvergence"
import type { AppStackParamList } from "@/navigators"
import { type RouteProp, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useLayoutEffect } from "react"
import { useModal } from "react-native-modalfy"
import { useBookEdit } from "./useBookEdit"

type BookEditScreenRouteProp = RouteProp<AppStackParamList, "BookEdit">

export const BookEditScreen: FC = observer(() => {
  const route = useRoute<BookEditScreenRouteProp>()
  const modal = useModal<ModalStackParams>()
  const convergenceHook = useConvergence()
  const { form, selectedBook, selectedLibrary, onSubmit } = useBookEdit()

  useLayoutEffect(() => {
    // Note: header options would be set here if navigation context was available
  }, [convergenceHook.isLarge, onSubmit])

  return (
    <RootContainer alignItems="center">
      <VStack justifyContent="flex-start" flex={1}>
        <FormImageUploader
          control={form.control as any}
          name={"cover"}
          defaultValue={route.params.imageUrl}
        />
        <BookEditFieldList
          book={selectedBook}
          control={form.control as any}
          fieldMetadataList={selectedLibrary.fieldMetadataList}
          tagBrowser={selectedLibrary.tagBrowser}
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
})
