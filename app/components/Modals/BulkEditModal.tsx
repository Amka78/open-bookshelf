import { BulkEditContent, Button, Heading } from "@/components"
import { useBulkEditForm } from "@/hooks"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { ScrollView } from "react-native"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type BulkEditModalProps = ModalComponentProp<ModalStackParams, void, "BulkEditModal">

export const BulkEditModal = observer((props: BulkEditModalProps) => {
  const { calibreRootStore } = useStores()
  const { books, libraryId, onComplete } = props.modal.params!

  const selectedLibrary = calibreRootStore.selectedLibrary!

  const { canSave, form, submit } = useBulkEditForm({
    books,
    libraryId,
    onSaved: () => {
      onComplete?.()
      props.modal.closeModal()
    },
  })

  return (
    <Root>
      <Header>
        <Heading isTruncated={true} tx={"modal.bulkEditModal.title"} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <ScrollView>
          <BulkEditContent
            books={books}
            control={form.control}
            fieldMetadataList={selectedLibrary.fieldMetadataList}
            tagBrowser={selectedLibrary.tagBrowser}
            fieldListProps={{ height: 320 }}
          />
        </ScrollView>
      </Body>
      <Footer>
        <Button onPress={() => submit()} tx={"common.save"} disabled={!canSave} />
        <Button onPress={() => props.modal.closeModal()} tx={"common.cancel"} marginLeft={"$1"} />
      </Footer>
    </Root>
  )
})
