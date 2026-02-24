import { useStores } from "@/models"
import type { Metadata } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { useForm } from "react-hook-form"

export function useBookEdit() {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const form = useForm<Metadata, unknown, Metadata>()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  const onSubmit = form.handleSubmit((value: any) => {
    selectedBook.update(selectedLibrary.id, value, Object.keys(value))
    navigation.goBack()
  })

  return {
    form,
    selectedBook,
    selectedLibrary,
    onSubmit,
  }
}
