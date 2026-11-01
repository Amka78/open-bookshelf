import { BulkEditContent, Button, HStack, RootContainer, VStack } from "@/components"
import { useBulkEditForm } from "@/hooks"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { Book } from "@/models/calibre"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { useLayoutEffect } from "react"

type BulkEditScreenRouteProp = RouteProp<AppStackParamList, "BulkEdit">

export const BulkEditScreen = observer(() => {
  const route = useRoute<BulkEditScreenRouteProp>()
  const navigation = useNavigation<ApppNavigationProp>()
  const { calibreRootStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary!
  const { bookIds, libraryId, onComplete } = route.params

  const books = bookIds
    .map((id) => selectedLibrary.books.get(String(id)))
    .filter((book): book is Book => book !== undefined)

  const { canSave, form, submit } = useBulkEditForm({
    books,
    libraryId,
    onSaved: () => {
      onComplete?.()
      navigation.goBack()
    },
  })

  useLayoutEffect(() => {
    navigation.setOptions({ title: translate("modal.bulkEditModal.title") ?? undefined })
  }, [navigation])

  return (
    <RootContainer>
      <VStack flex={1} space="sm">
        <BulkEditContent
          books={books}
          control={form.control}
          fieldMetadataList={selectedLibrary.fieldMetadataList}
          tagBrowser={selectedLibrary.tagBrowser}
          containerProps={{ flex: 1 }}
          fieldListProps={{ flex: 1 }}
        />
        <HStack space="sm" justifyContent="flex-end">
          <Button tx="common.cancel" onPress={() => navigation.goBack()} />
          <Button
            tx="common.save"
            onPress={() => submit()}
            disabled={!canSave}
            testID="bulk-edit-save"
          />
        </HStack>
      </VStack>
    </RootContainer>
  )
})
