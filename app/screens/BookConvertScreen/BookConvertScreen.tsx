import { Heading, RootContainer } from "@/components"
import { BookConvertForm } from "@/components/BookConvertForm/BookConvertForm"
import type { ConvertStatus } from "@/components/BookConvertForm/BookConvertForm"
import type { ConvertOptions } from "@/components/BookConvertForm/ConvertOptions"
import { translate } from "@/i18n"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useLayoutEffect } from "react"
import type { Control, UseFormWatch } from "react-hook-form"
import { useBookConvert } from "./useBookConvert"

export const BookConvertScreen: FC = observer(() => {
  const navigation = useNavigation<ApppNavigationProp>()
  const { selectedBook, formats, form, convertStatus, errorMessage, handleConvert } =
    useBookConvert()

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
        control={form.control}
        watch={form.watch}
        convertStatus={convertStatus}
        errorMessage={errorMessage}
        onConvert={handleConvert}
      />
    </RootContainer>
  )
})

/**
 * Storybook / テスト用テンプレート (ストアに依存しないプレゼンテーション版)
 */
export type BookConvertScreenTemplateProps = {
  bookTitle?: string
  formats: string[]
  control: Control<ConvertOptions>
  watch: UseFormWatch<ConvertOptions>
  convertStatus: ConvertStatus
  errorMessage: string | null
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
        control={props.control}
        watch={props.watch}
        convertStatus={props.convertStatus}
        errorMessage={props.errorMessage}
        onConvert={props.onConvert}
      />
    </RootContainer>
  )
}
