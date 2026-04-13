import { Button, Heading, RootContainer } from "@/components"
import { BookConvertForm } from "@/components/BookConvertForm/BookConvertForm"
import type { ConvertStatus } from "@/components/BookConvertForm/BookConvertForm"
import type { ConvertOptions } from "@/components/BookConvertForm/ConvertOptions"
import { translate } from "@/i18n"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useLayoutEffect } from "react"
import type { Control, UseFormWatch } from "react-hook-form"
import { useBookConvert } from "./useBookConvert"

export const BookConvertScreen: FC = observer(() => {
  const navigation = useNavigation<ApppNavigationProp>()
  const {
    selectedBook,
    inputFormats,
    outputFormats,
    isLoadingFormats,
    form,
    convertStatus,
    errorMessage,
    handleConvert,
  } = useBookConvert()

  const outputFormat = form.watch("outputFormat")

  useLayoutEffect(() => {
    const isDisabled = convertStatus === "converting" || !outputFormat
    navigation.setOptions({
      headerTitle: translate("modal.bookConvertModal.title"),
      headerRight: () => (
        <Button tx="bookConvertScreen.convert" onPress={handleConvert} isDisabled={isDisabled} />
      ),
    })
  }, [navigation, handleConvert, convertStatus, outputFormat])

  return (
    <RootContainer padding={"$4"}>
      <Heading isTruncated={true} marginBottom={"$3"}>
        {selectedBook?.metaData?.title ?? ""}
      </Heading>
      <BookConvertForm
        inputFormats={inputFormats}
        outputFormats={outputFormats}
        isLoadingFormats={isLoadingFormats}
        control={form.control}
        watch={form.watch}
        convertStatus={convertStatus}
        errorMessage={errorMessage}
      />
    </RootContainer>
  )
})

/**
 * Storybook / テスト用テンプレート (ストアに依存しないプレゼンテーション版)
 */
export type BookConvertScreenTemplateProps = {
  bookTitle?: string
  inputFormats: string[]
  outputFormats: string[]
  control: Control<ConvertOptions>
  watch: UseFormWatch<ConvertOptions>
  convertStatus: ConvertStatus
  errorMessage: string | null
}

export function BookConvertScreenTemplate(props: BookConvertScreenTemplateProps) {
  return (
    <RootContainer padding={"$4"}>
      <Heading isTruncated={true} marginBottom={"$3"}>
        {props.bookTitle ?? ""}
      </Heading>
      <BookConvertForm
        inputFormats={props.inputFormats}
        outputFormats={props.outputFormats}
        control={props.control}
        watch={props.watch}
        convertStatus={props.convertStatus}
        errorMessage={props.errorMessage}
      />
    </RootContainer>
  )
}
