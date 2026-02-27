import { Heading } from "@/components"
import { Button } from "@/components"
import { BookConvertForm } from "@/components/BookConvertForm/BookConvertForm"
import { useStores } from "@/models"
import { useBookConvert } from "@/screens/BookConvertScreen/useBookConvert"
import { observer } from "mobx-react-lite"
import { useModal } from "react-native-modalfy"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body, CloseButton, Footer, Header, Root } from "./"
import type { ModalStackParams } from "./Types"

export type BookConvertModalProps = ModalComponentProp<ModalStackParams, void, "BookConvertModal">

export const BookConvertModal = observer((props: BookConvertModalProps) => {
  const { calibreRootStore } = useStores()
  const selectedBook = calibreRootStore.selectedLibrary.selectedBook

  return (
    <BookConvertModalTemplate
      modal={{
        ...props.modal,
        params: {
          ...props.modal.params,
          selectedBook,
        },
      }}
    />
  )
})

export function BookConvertModalTemplate(props: BookConvertModalProps) {
  const {
    formats,
    selectedFormat,
    convertStatus,
    errorMessage,
    handleFormatSelect,
    handleConvert,
  } = useBookConvert()

  const bookTitle = props.modal.params.selectedBook?.metaData?.title ?? ""

  const handleConvertAndClose = async () => {
    await handleConvert()
    if (props.modal.params.onConvertComplete) {
      props.modal.params.onConvertComplete()
    }
  }

  return (
    <Root>
      <Header>
        <Heading isTruncated={true} tx={"modal.bookConvertModal.title"} />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <Heading isTruncated={true} marginBottom={"$2"} size={"sm"}>
          {bookTitle}
        </Heading>
        <BookConvertForm
          formats={formats}
          selectedFormat={selectedFormat}
          convertStatus={convertStatus}
          errorMessage={errorMessage}
          onFormatSelect={handleFormatSelect}
          onConvert={handleConvertAndClose}
        />
      </Body>
      <Footer>
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.cancel"}
        />
      </Footer>
    </Root>
  )
}
