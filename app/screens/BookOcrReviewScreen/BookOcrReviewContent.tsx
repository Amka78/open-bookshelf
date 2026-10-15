import {
  BookEditFieldList,
  BookImageItem,
  Box,
  Button,
  HStack,
  LabeledSpinner,
  Text,
  VStack,
} from "@/components"
import type { useBookOcrReviewController } from "./useBookOcrReview"

type BookOcrReviewContentProps = Pick<
  ReturnType<typeof useBookOcrReviewController>,
  | "convergenceHook"
  | "form"
  | "ocrState"
  | "fieldSummaries"
  | "recognizedText"
  | "selectedBook"
  | "selectedLibrary"
  | "imageUrl"
  | "applyFieldEntry"
>

export function BookOcrReviewContent({
  convergenceHook,
  form,
  ocrState,
  fieldSummaries,
  recognizedText,
  selectedBook,
  selectedLibrary,
  imageUrl,
  applyFieldEntry,
}: BookOcrReviewContentProps) {
  const isLarge = convergenceHook.isLarge
  const layoutProps = isLarge
    ? ({
        alignItems: "stretch",
        flexDirection: "row",
        flex: 1,
        minHeight: 0,
      } as const)
    : ({
        alignItems: "stretch",
        flexDirection: "column",
      } as const)

  return (
    <HStack space="lg" width="$full" padding="$3" {...layoutProps}>
      <VStack
        flex={isLarge ? 0.35 : undefined}
        width="$full"
        minHeight={isLarge ? 0 : undefined}
        justifyContent={isLarge ? "center" : undefined}
      >
        <VStack space="md">
          <BookImageItem source={imageUrl} />
          {ocrState.status === "loading" ? (
            <LabeledSpinner labelDirection="horizontal" labelTx="bookOcrReviewScreen.processing" />
          ) : null}
          {ocrState.status === "error" ? (
            <Text color="$red500" testID="book-ocr-error-message">
              {ocrState.errorMessage}
            </Text>
          ) : null}
          <VStack
            borderWidth={1}
            borderColor="$borderLight300"
            borderRadius="$md"
            padding="$3"
            space="sm"
            testID="book-ocr-detected-fields"
          >
            <Text fontWeight="$bold" tx="bookOcrReviewScreen.detectedFields" />
            {fieldSummaries.length > 0 ? (
              fieldSummaries.map((entry) => (
                <Box
                  key={`${entry.field}-${entry.displayValue}`}
                  borderWidth={1}
                  borderColor="$borderLight200"
                  borderRadius="$sm"
                  padding="$3"
                >
                  <VStack space="xs">
                    <Text fontWeight="$bold">{entry.displayLabel}</Text>
                    <Text>{entry.displayValue}</Text>
                    <Button
                      onPress={() => applyFieldEntry(entry)}
                      testID={entry.testID}
                      tx="bookOcrReviewScreen.applyDetectedValue"
                    />
                  </VStack>
                </Box>
              ))
            ) : (
              <Text tx="bookOcrReviewScreen.noDetectedFields" />
            )}
          </VStack>
          <VStack
            borderWidth={1}
            borderColor="$borderLight300"
            borderRadius="$md"
            padding="$3"
            space="sm"
          >
            <Text fontWeight="$bold" tx="bookOcrReviewScreen.recognizedText" />
            <Text testID="book-ocr-full-text">{recognizedText || "-"}</Text>
          </VStack>
        </VStack>
      </VStack>
      <VStack flex={1} width="$full" space="md" minHeight={isLarge ? 0 : undefined}>
        <Text fontWeight="$bold" tx="bookOcrReviewScreen.reviewAndEdit" />
        <BookEditFieldList
          book={selectedBook}
          control={form.control}
          fieldMetadataList={selectedLibrary.fieldMetadataList}
          tagBrowser={selectedLibrary.tagBrowser}
          flex={1}
          minHeight={0}
          scrollViewProps={isLarge ? { flex: 1, nestedScrollEnabled: true } : undefined}
        />
      </VStack>
    </HStack>
  )
}
