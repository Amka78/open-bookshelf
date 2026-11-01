import { CalibreRootContent, Heading, VStack } from "@/components"
import { useCalibreRoot } from "@/hooks"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type CalibreRootModalProps = ModalComponentProp<ModalStackParams, void, "CalibreRootModal">

export const CalibreRootModal = observer((props: CalibreRootModalProps) => {
  const { calibreRootStore } = useStores()
  const { library, onLibraryPress } = useCalibreRoot()
  const canClose = Boolean(calibreRootStore.selectedLibrary)

  const onSelect = (id: string) => {
    props.modal.closeAllModals(() => {
      onLibraryPress(id)
    })
  }

  return (
    <Root onBackdropPress={canClose ? () => props.modal.closeModal() : undefined}>
      <Header>
        <Heading isTruncated={true} tx="calibreRootScreen.title" />
        {canClose ? <CloseButton onPress={() => props.modal.closeModal()} /> : null}
      </Header>
      <Body>
        <VStack height={320}>
          <CalibreRootContent libraries={library} onSelect={onSelect} />
        </VStack>
      </Body>
    </Root>
  )
})
