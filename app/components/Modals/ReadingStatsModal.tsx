import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import { useStores } from "@/models"
import { HStack, ScrollView, VStack } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type ReadingStatsModalProps = ModalComponentProp<ModalStackParams, void, "ReadingStatsModal">

export const ReadingStatsModal = observer((props: ReadingStatsModalProps) => {
  const { calibreRootStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary

  const inProgressHistories = calibreRootStore.readingHistories.filter((h) => h.currentPage > 0)
  const cachedHistories = calibreRootStore.readingHistories.filter((h) => h.cachedPath.length > 0)

  // Last 5 recently read (in progress), most recent last → reverse for display
  const recentHistories = inProgressHistories.slice(-5).reverse()

  return (
    <Root>
      <Header>
        <Heading tx="readingStats.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <VStack space="md" padding="$2">
          <HStack justifyContent="space-between">
            <Text tx="readingStats.booksInProgress" />
            <Text>{String(inProgressHistories.length)}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text tx="readingStats.cachedBooks" />
            <Text>{String(cachedHistories.length)}</Text>
          </HStack>
          <Text tx="readingStats.recentlyRead" fontWeight="$bold" />
          <ScrollView>
            {recentHistories.length === 0 ? (
              <Text tx="readingStats.noRecentBooks" />
            ) : (
              <VStack space="xs">
                {recentHistories.map((h) => {
                  const book = selectedLibrary?.books.get(h.bookId.toString())
                  const title = book?.metaData?.title ?? String(h.bookId)
                  return (
                    <Text
                      key={`${h.libraryId}-${h.bookId}-${h.format}`}
                      numberOfLines={1}
                    >{title}</Text>
                  )
                })}
              </VStack>
            )}
          </ScrollView>
        </VStack>
      </Body>
      <Footer>
        <Button onPress={() => props.modal.closeModal()} tx="common.ok" />
      </Footer>
    </Root>
  )
})
