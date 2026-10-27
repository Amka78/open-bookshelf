import {
  BookEditField,
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  TooltipIconButton,
  VStack,
} from "@/components"
import { useBookEditAutoActions, useBookEditFields } from "@/hooks"
import { translate } from "@/i18n"
import type {
  Book,
  Category,
  FieldMetadata,
  FieldMetadataMap,
  MetadataSnapshotIn,
} from "@/models/calibre"
import type { BookFieldEditDatatype, BookFieldEditNavRequest } from "@/navigators/types"
import {
  Tabs,
  TabsTab,
  TabsTabList,
  TabsTabPanel,
  TabsTabPanels,
  TabsTabTitle,
} from "@gluestack-ui/themed"
import { type ComponentProps, Fragment, type ReactNode } from "react"
import { type Control, type Path, useWatch } from "react-hook-form"

export type BookEditFieldNavListProps = {
  fieldMetadataList: FieldMetadataMap
  book: Book
  control: Control<MetadataSnapshotIn, unknown>
  tagBrowser?: Category[]
  onUploadFormat?: (params: { targetFormat?: string }) => Promise<{
    success: boolean
    format?: string
  }>
  /** テキスト系フィールドの行タップ時に呼ばれる（EditScreen が BookFieldEdit へ遷移する） */
  onOpenField: (request: BookFieldEditNavRequest) => void
} & ComponentProps<typeof Box>

/** EditScreen にインライン表示する非テキスト系フィールドか */
function isInlineField(metadata: FieldMetadata): boolean {
  return (
    metadata.label === "formats" ||
    metadata.datatype === "rating" ||
    metadata.datatype === "bool" ||
    metadata.datatype === "datetime"
  )
}

function resolveNavType(metadata: FieldMetadata): BookFieldEditDatatype {
  if (metadata.label === "identifiers") return "identifiers"
  if (metadata.datatype === "comments") return "comments"
  if (metadata.datatype === "int") return "int"
  if (metadata.datatype === "float") return "float"
  if (metadata.datatype === "text" && metadata.isMultiple) return "multiple"
  return "text"
}

/** authors / title 行のみに表示する自動設定ボタン */
function AutoActionsButtons({
  label,
  control,
}: {
  label: string
  control: Control<MetadataSnapshotIn, unknown>
}) {
  const { onAuthorSortAuto, onTitleSortAuto, onTitleSeriesAuto } = useBookEditAutoActions(control)

  if (label === "authors") {
    return (
      <TooltipIconButton
        name="sort-alphabetical-ascending"
        iconSize="sm"
        tooltipTx="bookEditScreen.authorSortAutoTooltip"
        onPress={onAuthorSortAuto}
      />
    )
  }

  if (label === "title") {
    return (
      <>
        <TooltipIconButton
          name="sort-alphabetical-ascending"
          iconSize="sm"
          tooltipTx="bookEditScreen.titleSortAutoTooltip"
          onPress={onTitleSortAuto}
        />
        <TooltipIconButton
          name="format-list-numbered"
          iconSize="sm"
          tooltipTx="bookEditScreen.titleSeriesAutoTooltip"
          onPress={onTitleSeriesAuto}
        />
      </>
    )
  }

  return null
}

function formatNavValue(value: unknown, datatype: BookFieldEditDatatype): string {
  if (value == null) return ""
  if (Array.isArray(value)) {
    return value.filter((entry) => entry != null && String(entry).trim() !== "").join(", ")
  }
  if (datatype === "identifiers" && typeof value === "object") {
    return Object.entries(value as Record<string, string>)
      .map(([key, entry]) => `${key}: ${entry}`)
      .join(", ")
  }
  return String(value)
}

function NavFieldRow({
  title,
  formPath,
  datatype,
  control,
  suggestions,
  textToValue,
  valueToText,
  onOpenField,
  headerActions,
}: {
  title: string
  formPath: string
  datatype: BookFieldEditDatatype
  control: Control<MetadataSnapshotIn, unknown>
  suggestions?: string[]
  textToValue?: string
  valueToText?: string
  onOpenField: (request: BookFieldEditNavRequest) => void
  headerActions?: ReactNode
}) {
  const value = useWatch({ control, name: formPath as Path<MetadataSnapshotIn> })

  const request: BookFieldEditNavRequest = {
    title,
    formPath,
    datatype,
    suggestions,
    textToValue,
    valueToText,
  }

  return (
    <Pressable
      testID={`book-edit-nav-${formPath}`}
      onPress={() => {
        onOpenField(request)
      }}
    >
      <VStack alignItems="flex-start" space={"sm"} marginBottom={"$2.5"}>
        <HStack alignItems="center" space={"xs"}>
          <Text isTruncated={true} fontWeight="$bold">
            {title}
          </Text>
          {headerActions}
        </HStack>
        <Text isTruncated={true} fontSize="$sm" color="$textLight500">
          {formatNavValue(value, datatype) || "—"}
        </Text>
      </VStack>
    </Pressable>
  )
}

/**
 * EditScreen 専用のフィールドリスト。
 * テキスト入力系は行タップで BookFieldEdit に遷移し、非テキスト系（rating/bool/datetime/formats）は
 * インライン表示する。モーダル/OCR側の BookEditFieldList とは別コンポーネント。
 */
export function BookEditFieldNavList(props: BookEditFieldNavListProps) {
  const { onOpenField, ...boxProps } = props
  const { standardFields, customFields } = useBookEditFields({
    fieldMetadataList: props.fieldMetadataList,
    tagBrowser: props.tagBrowser,
    metaData: props.book.metaData ?? undefined,
  })

  const renderRow = (entry: (typeof standardFields)[number]) => {
    const { label, formPath, metadata, suggestions } = entry

    if (isInlineField(metadata)) {
      return (
        <BookEditField
          key={label}
          book={props.book}
          control={props.control}
          fieldMetadata={metadata}
          suggestions={suggestions}
          onUploadFormat={props.onUploadFormat}
        />
      )
    }

    if (label === "series") {
      return (
        <Fragment key={`${label}-block`}>
          <NavFieldRow
            title={metadata.name ?? label}
            formPath={String(formPath)}
            datatype="text"
            control={props.control}
            suggestions={suggestions}
            onOpenField={onOpenField}
          />
          <NavFieldRow
            title={translate("bookEditScreen.seriesIndex") ?? "Series Number"}
            formPath="seriesIndex"
            datatype="int"
            control={props.control}
            onOpenField={onOpenField}
          />
        </Fragment>
      )
    }

    const headerActions =
      label === "authors" || label === "title" ? (
        <AutoActionsButtons label={label} control={props.control} />
      ) : undefined

    return (
      <NavFieldRow
        key={label}
        title={metadata.name ?? label}
        formPath={String(formPath)}
        datatype={resolveNavType(metadata)}
        control={props.control}
        suggestions={suggestions}
        textToValue={metadata.isMultiple?.uiToList ?? undefined}
        valueToText={metadata.isMultiple?.listToUi ?? undefined}
        onOpenField={onOpenField}
        headerActions={headerActions}
      />
    )
  }

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
            <ScrollView>{standardFields.map(renderRow)}</ScrollView>
          </TabsTabPanel>
          <TabsTabPanel value="custom">
            <ScrollView>
              {customFields.length > 0 ? (
                customFields.map(renderRow)
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
