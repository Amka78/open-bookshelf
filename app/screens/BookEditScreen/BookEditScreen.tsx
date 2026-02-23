import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useModal } from "react-native-modalfy"
import { BookEditScreen as Template } from "./template/BookEditScreen"

type BookEditScreenRouteProp = RouteProp<AppStackParamList, "BookEdit">
export const BookEditScreen: FC = observer(() => {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const route = useRoute<BookEditScreenRouteProp>()
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  return (
    <Template
      imageUrl={route.params.imageUrl}
      book={selectedBook}
      fieldMetadataList={selectedLibrary.fieldMetadataList}
      tagBrowser={selectedLibrary.tagBrowser}
      onSubmitPress={(query) => {
        selectedBook.update(selectedLibrary.id, query, Object.keys(query))
        navigation.goBack()
      }}
    />
  )
})
