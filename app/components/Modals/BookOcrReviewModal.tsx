import { Button } from "@/components/Button/Button"
import { ScrollView } from "@/components/ScrollView/ScrollView"
import { Heading } from "@/components/Heading/Heading"
import { BookOcrReviewContent } from "@/screens/BookOcrReviewScreen/BookOcrReviewContent"
import { useBookOcrReviewController } from "@/screens/BookOcrReviewScreen/useBookOcrReview"
import { observer } from "mobx-react-lite"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type BookOcrReviewModalProps = ModalComponentProp<
  ModalStackParams,
  unknown,
  "BookOcrReviewModal"
>

export const BookOcrReviewModal = observer((props: BookOcrReviewModalProps) => {
  const controller = useBookOcrReviewController({
    imageUrl: props.modal.params.imageUrl,
    onComplete: () => {
      props.modal.closeModal()
    },
  })

  return (
    <Root width="96%" maxWidth={1180} maxHeight="92%">
      <Header>
        <Heading isTruncated={true} tx="bookOcrReviewScreen.title" />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body flex={1} minHeight={0}>
        {controller.convergenceHook.isLarge ? (
          <BookOcrReviewContent
            convergenceHook={controller.convergenceHook}
            form={controller.form}
            ocrState={controller.ocrState}
            fieldSummaries={controller.fieldSummaries}
            recognizedText={controller.recognizedText}
            selectedBook={controller.selectedBook}
            selectedLibrary={controller.selectedLibrary}
            imageUrl={controller.imageUrl}
            applyFieldEntry={controller.applyFieldEntry}
          />
        ) : (
          <ScrollView
            flex={1}
            minHeight={0}
            keyboardShouldPersistTaps="handled"
            testID="book-ocr-review-modal-scroll"
          >
            <BookOcrReviewContent
              convergenceHook={controller.convergenceHook}
              form={controller.form}
              ocrState={controller.ocrState}
              fieldSummaries={controller.fieldSummaries}
              recognizedText={controller.recognizedText}
              selectedBook={controller.selectedBook}
              selectedLibrary={controller.selectedLibrary}
              imageUrl={controller.imageUrl}
              applyFieldEntry={controller.applyFieldEntry}
            />
          </ScrollView>
        )}
      </Body>
      <Footer>
        <Button onPress={controller.onSubmit} testID="book-ocr-save-button" tx="common.save" />
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx="common.cancel"
          marginLeft="$1"
        />
      </Footer>
    </Root>
  )
})
