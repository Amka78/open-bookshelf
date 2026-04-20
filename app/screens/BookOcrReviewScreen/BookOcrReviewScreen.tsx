import { Button, RootContainer, ScrollView, VStack } from "@/components"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { KeyboardAvoidingView, Platform } from "react-native"
import { BookOcrReviewContent } from "./BookOcrReviewContent"
import { useBookOcrReview } from "./useBookOcrReview"

export const BookOcrReviewScreen: FC = observer(() => {
  const {
    convergenceHook,
    form,
    ocrState,
    fieldSummaries,
    recognizedText,
    selectedBook,
    selectedLibrary,
    imageUrl,
    onSubmit,
    applyFieldEntry,
  } = useBookOcrReview()

  return (
    <RootContainer alignItems="center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        {convergenceHook.isLarge ? (
          <VStack flex={1} minHeight={0}>
            <BookOcrReviewContent
              convergenceHook={convergenceHook}
              form={form}
              ocrState={ocrState}
              fieldSummaries={fieldSummaries}
              recognizedText={recognizedText}
              selectedBook={selectedBook}
              selectedLibrary={selectedLibrary}
              imageUrl={imageUrl}
              applyFieldEntry={applyFieldEntry}
            />
          </VStack>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled" testID="book-ocr-review-screen-scroll">
            <BookOcrReviewContent
              convergenceHook={convergenceHook}
              form={form}
              ocrState={ocrState}
              fieldSummaries={fieldSummaries}
              recognizedText={recognizedText}
              selectedBook={selectedBook}
              selectedLibrary={selectedLibrary}
              imageUrl={imageUrl}
              applyFieldEntry={applyFieldEntry}
            />
          </ScrollView>
        )}
        <VStack padding="$3">
          <Button onPress={onSubmit} testID="book-ocr-save-button" tx="common.save" />
        </VStack>
      </KeyboardAvoidingView>
    </RootContainer>
  )
})
