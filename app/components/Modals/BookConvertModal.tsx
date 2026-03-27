import { BookConvertForm } from "@/components/BookConvertForm/BookConvertForm"
import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { useBookConvert } from "@/screens/BookConvertScreen/useBookConvert"
import { observer } from "mobx-react-lite"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type BookConvertModalProps = ModalComponentProp<
  ModalStackParams,
  unknown,
  "BookConvertModal"
>

export const BookConvertModal = observer((props: BookConvertModalProps) => {
  return <BookConvertModalTemplate {...props} />
})

export function BookConvertModalTemplate(props: BookConvertModalProps) {
  const {
    selectedBook,
    inputFormats,
    outputFormats,
    form,
    convertStatus,
    errorMessage,
    handleConvert,
  } = useBookConvert()
  const outputFormat = form.watch("outputFormat") ?? ""
  const isConverting = convertStatus === "converting"

  const bookTitle = selectedBook?.metaData?.title ?? ""

  const handleConvertAndNotify = async () => {
    await handleConvert()
    if (props.modal.params.onConvertComplete) {
      props.modal.params.onConvertComplete()
    }
  }

  return (
    <Root width="94%" maxWidth={960}>
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
          inputFormats={inputFormats}
          outputFormats={outputFormats}
          control={form.control}
          watch={form.watch}
          convertStatus={convertStatus}
          errorMessage={errorMessage}
        />
      </Body>
      <Footer>
        <Button
          testID="convert-button"
          onPress={handleConvertAndNotify}
          tx={"bookConvertScreen.convert"}
          isDisabled={!outputFormat || isConverting}
        />
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.cancel"}
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
}
