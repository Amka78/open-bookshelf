import { Box, FormInputField, HStack, Input, ScrollView, Text, VStack } from "@/components"
import type { Book, Category, FieldMetadataMap, MetadataSnapshotIn } from "@/models/calibre"
import { translate } from "@/i18n"
import {
  Tabs,
  TabsTab,
  TabsTabList,
  TabsTabPanel,
  TabsTabPanels,
  TabsTabTitle,
} from "@gluestack-ui/themed"
import type { ComponentProps } from "react"
import { useRef } from "react"
import type { Control, Path } from "react-hook-form"
import { Keyboard, View, findNodeHandle } from "react-native"
import { BookEditField } from "./BookEditField"
import { useEditFieldSuggestions } from "./useEditFieldSuggestions"

/** Standard field labels shown in the fixed sorted order */

export type BookEditFieldListProps = {
  fieldMetadataList: FieldMetadataMap
  book: Book
  control: Control<MetadataSnapshotIn, unknown>
  tagBrowser?: Category[]
  onUploadFormat?: (params: { targetFormat?: string }) => Promise<{
    success: boolean
    format?: string
  }>
  /** フォーカス時にコンテナのnodeHandleを渡すコールバック */
  onTextInputFocus?: (getContainerHandle: () => number | null) => void
  scrollViewProps?: ComponentProps<typeof ScrollView>
} & ComponentProps<typeof Box>

const EditFieldSort = [
  "authors",
  "authorSort",
  "title",
  "sort",
  "series",
  "tags",
  "languages",
  "publisher",
  "pubdate",
  "formats",
  "identifiers",
  "rating",
  "comments",
]
export function BookEditFieldList(props: BookEditFieldListProps) {
  const { scrollViewProps, ...boxProps } = props
  const { suggestionMap, languageCodeSuggestions } = useEditFieldSuggestions({
    tagBrowser: props.tagBrowser,
    metaData: props.book.metaData,
  })

  // --- フォーカスチェーン管理 ---
  const focusChainRef = useRef<{ id: string; focus: () => void }[]>([])

  const registerFocusChain = (id: string, focus: () => void): (() => void) => {
    focusChainRef.current = [...focusChainRef.current, { id, focus }]
    return () => {
      focusChainRef.current = focusChainRef.current.filter((item) => item.id !== id)
    }
  }

  const focusNext = (id: string) => {
    const chain = focusChainRef.current
    const index = chain.findIndex((item) => item.id === id)
    if (index >= 0 && index < chain.length - 1) {
      chain[index + 1].focus()
    } else {
      Keyboard.dismiss()
    }
  }

  // series フィールドのコンテナ ref（ラベル表示用）
  const seriesContainerRef = useRef<View | null>(null)
  const getSeriesContainerHandle = () => findNodeHandle(seriesContainerRef.current)

  const fields = EditFieldSort.map((label) => {
    const value = props.fieldMetadataList.get(label)
    if (!value || !value.isEditable || !value.name) {
      return null
    }

    const suggestions =
      label === "languages" &&
      (value.linkColumn === "lamg_code" || value.linkColumn === "lang_code")
        ? languageCodeSuggestions
        : suggestionMap.get(value.label)
    if (label === "series") {
      const seriesIndexName = "seriesIndex" as Path<MetadataSnapshotIn>
      const seriesName = value.label as Path<MetadataSnapshotIn>

      return (
        <View key={`${value.label}-seriesIndex`} ref={seriesContainerRef}>
          <HStack space="sm" alignItems="flex-start" width="$full">
            <VStack
              alignItems="flex-start"
              space={"sm"}
              marginBottom={"$2.5"}
              flex={1}
              width="$full"
            >
              <Text isTruncated={true} fontWeight="$bold">
                {value.name}
              </Text>
              <Input>
                <FormInputField
                  control={props.control}
                  name={seriesName}
                  suggestions={suggestions}
                  onInputFocus={() => props.onTextInputFocus?.(getSeriesContainerHandle)}
                  onRegisterFocusChain={registerFocusChain}
                  onSubmitEditing={() => focusNext(String(seriesName))}
                  returnKeyType="next"
                  width="$full"
                />
              </Input>
            </VStack>
            <VStack alignItems="flex-start" space={"sm"} marginBottom={"$2.5"} width={"$10"}>
              <Box height="$6" />
              <Input width={"$10"}>
                <FormInputField
                  control={props.control}
                  name={seriesIndexName}
                  inputMode="numeric"
                  onInputFocus={() => props.onTextInputFocus?.(getSeriesContainerHandle)}
                  onRegisterFocusChain={registerFocusChain}
                  onSubmitEditing={() => focusNext(String(seriesIndexName))}
                  returnKeyType="next"
                />
              </Input>
            </VStack>
          </HStack>
        </View>
      )
    }

    return (
      <BookEditField
        key={value.label}
        book={props.book}
        control={props.control}
        fieldMetadata={value}
        suggestions={suggestions}
        onUploadFormat={props.onUploadFormat}
        onTextInputFocus={props.onTextInputFocus}
        onRegisterFocusChain={registerFocusChain}
        onSubmitEditing={() => focusNext(value.label)}
      />
    )
  })

  const customFields = Array.from(props.fieldMetadataList.values())
    .filter((f) => f.isCustom && f.isEditable && f.name)
    .map((f) => (
      <BookEditField
        key={f.label}
        book={props.book}
        control={props.control}
        fieldMetadata={f}
        formPath={`customColumns.${f.label}` as Path<MetadataSnapshotIn>}
        suggestions={suggestionMap.get(f.label)}
        onTextInputFocus={props.onTextInputFocus}
        onRegisterFocusChain={registerFocusChain}
        onSubmitEditing={() => focusNext(f.label)}
      />
    ))

  return (
    <Box {...boxProps}>
      <Tabs value="standard" testID="book-edit-tabs">
        <TabsTabList testID="book-edit-tab-list">
          <TabsTab value="standard" testID="book-edit-tab-standard">
            <TabsTabTitle>{translate("bookEditScreen.standardFieldsTab")}</TabsTabTitle>
          </TabsTab>
          {customFields.length > 0 && (
            <TabsTab value="custom" testID="book-edit-tab-custom">
              <TabsTabTitle>{translate("bookEditScreen.customFieldsTab")}</TabsTabTitle>
            </TabsTab>
          )}
        </TabsTabList>
        <TabsTabPanels>
          <TabsTabPanel value="standard">
            <ScrollView {...scrollViewProps}>{fields}</ScrollView>
          </TabsTabPanel>
          <TabsTabPanel value="custom">
            <ScrollView {...scrollViewProps}>
              {customFields.length > 0 ? (
                customFields
              ) : (
                <Text color="$textLight500" fontSize="$sm">
                  {translate("bookEditScreen.noCustomFields")}
                </Text>
              )}
            </ScrollView>
          </TabsTabPanel>
        </TabsTabPanels>
      </Tabs>
    </Box>
  )
}
