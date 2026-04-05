import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import { useStores } from "@/models"
import { HStack, VStack } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { Pressable } from "react-native"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type UserPreferencesModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  "UserPreferencesModal"
>

const FORMAT_OPTIONS = ["Auto", "EPUB", "PDF", "MOBI", "AZW3", "CBZ"] as const
const DATE_FORMAT_OPTIONS = ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"] as const
const BOOKS_PER_PAGE_OPTIONS = [25, 50, 100] as const

function ChipRow<T extends string | number>({
  options,
  selected,
  onSelect,
  labelOf,
}: {
  options: readonly T[]
  selected: T | null
  onSelect: (value: T) => void
  labelOf?: (value: T) => string
}) {
  return (
    <HStack flexWrap="wrap" space="sm">
      {options.map((option) => {
        const isSelected = option === selected
        const label = labelOf ? labelOf(option) : String(option)
        return (
          <Pressable
            key={String(option)}
            onPress={() => onSelect(option)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isSelected ? "#6366f1" : "#d1d5db",
              backgroundColor: isSelected ? "#6366f1" : "transparent",
            }}
          >
            <Text
              text={label}
              style={{ color: isSelected ? "#ffffff" : undefined, fontSize: 13 }}
            />
          </Pressable>
        )
      })}
    </HStack>
  )
}

export const UserPreferencesModal = observer((props: UserPreferencesModalProps) => {
  const { settingStore } = useStores()

  const selectedFormat = settingStore.preferredFormat ?? "Auto"
  const selectedDate = settingStore.dateDisplayFormat
  const selectedBpp = settingStore.booksPerPage

  const onSelectFormat = (value: string) => {
    settingStore.setPreferredFormat(value === "Auto" ? null : value)
  }

  const onSelectDate = (value: string) => {
    settingStore.setDateDisplayFormat(value)
  }

  const onSelectBpp = (value: number) => {
    settingStore.setBooksPerPage(value)
  }

  return (
    <Root>
      <Header>
        <Heading tx="userPreferences.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <VStack space="lg" padding="$2">
          <VStack space="sm">
            <Text tx="userPreferences.preferredFormat" fontWeight="$bold" />
            <ChipRow
              options={FORMAT_OPTIONS}
              selected={selectedFormat}
              onSelect={onSelectFormat}
            />
          </VStack>
          <VStack space="sm">
            <Text tx="userPreferences.dateDisplayFormat" fontWeight="$bold" />
            <ChipRow
              options={DATE_FORMAT_OPTIONS}
              selected={selectedDate}
              onSelect={onSelectDate}
            />
          </VStack>
          <VStack space="sm">
            <Text tx="userPreferences.booksPerPage" fontWeight="$bold" />
            <ChipRow
              options={BOOKS_PER_PAGE_OPTIONS}
              selected={selectedBpp as (typeof BOOKS_PER_PAGE_OPTIONS)[number]}
              onSelect={onSelectBpp}
            />
          </VStack>
        </VStack>
      </Body>
      <Footer>
        <Button onPress={() => props.modal.closeModal()} tx="common.ok" />
      </Footer>
    </Root>
  )
})
