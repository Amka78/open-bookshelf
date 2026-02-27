import { Heading, RootContainer } from "@/components"
import { BookConvertForm } from "@/components/BookConvertForm/BookConvertForm"
import { translate } from "@/i18n"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useLayoutEffect } from "react"
import { useBookConvert } from "./useBookConvert"

export const BookConvertScreen: FC = observer(() => {
  const navigation = useNavigation<ApppNavigationProp>()
  const {
    selectedBook,
    formats,
    selectedFormat,
    convertStatus,
    errorMessage,
    handleFormatSelect,
    handleConvert,
  } = useBookConvert()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: translate("modal.bookConvertModal.title"),
    })
  }, [navigation])

  return (
    <RootContainer padding={"$4"}>
      <Heading isTruncated={true} marginBottom={"$3"}>
        {selectedBook?.metaData?.title ?? ""}
      </Heading>
      <BookConvertForm
        formats={formats}
        selectedFormat={selectedFormat}
        convertStatus={convertStatus}
        errorMessage={errorMessage}
        onFormatSelect={handleFormatSelect}
        onConvert={handleConvert}
      />
    </RootContainer>
  )
})

/**
 * Storybook用テンプレート (ストアに依存しないプレゼンテーション版)
 */
export type BookConvertScreenTemplateProps = {
  bookTitle?: string
  formats: string[]
  selectedFormat: string | null
  convertStatus: "idle" | "converting" | "success" | "error"
  errorMessage: string | null
  onFormatSelect: (format: string) => void
  onConvert: () => void
}

export function BookConvertScreenTemplate(props: BookConvertScreenTemplateProps) {
  return (
    <RootContainer padding={"$4"}>
      <Heading isTruncated={true} marginBottom={"$3"}>
        {props.bookTitle ?? ""}
      </Heading>
      <BookConvertForm
        formats={props.formats}
        selectedFormat={props.selectedFormat}
        convertStatus={props.convertStatus}
        errorMessage={props.errorMessage}
        onFormatSelect={props.onFormatSelect}
        onConvert={props.onConvert}
      />
    </RootContainer>
  )
}
