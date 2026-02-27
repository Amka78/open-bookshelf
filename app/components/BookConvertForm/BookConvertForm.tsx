import { Button, Heading, LabeledSpinner, ScrollView, Text, VStack } from "@/components"
import { translate } from "@/i18n"
import { ButtonGroup } from "@gluestack-ui/themed"
import React from "react"

export type ConvertStatus = "idle" | "converting" | "success" | "error"

export type BookConvertFormProps = {
  formats: string[]
  selectedFormat: string | null
  convertStatus: ConvertStatus
  errorMessage: string | null
  onFormatSelect: (format: string) => void
  onConvert: () => void
}

export function BookConvertForm(props: BookConvertFormProps) {
  const { formats, selectedFormat, convertStatus, errorMessage, onFormatSelect, onConvert } = props

  const isConverting = convertStatus === "converting"
  const isSuccess = convertStatus === "success"
  const isError = convertStatus === "error"

  return (
    <VStack space={"md"} flex={1}>
      {/* 変換元フォーマット */}
      <VStack space={"xs"}>
        <Text fontWeight="$bold" tx={"bookConvertScreen.inputFormat"} />
        <Text>
          {formats.length > 0 ? formats.join(", ") : translate("bookConvertScreen.noFormats")}
        </Text>
      </VStack>

      {/* 変換先フォーマット選択 */}
      <VStack space={"xs"}>
        <Text fontWeight="$bold" tx={"bookConvertScreen.outputFormat"} />
        {formats.length > 0 ? (
          <ScrollView>
            <ButtonGroup flexDirection="row" flexWrap="wrap">
              {formats.map((format) => (
                <Button
                  key={format}
                  testID={`format-button-${format}`}
                  variant={selectedFormat === format ? "solid" : "outline"}
                  onPress={() => onFormatSelect(format)}
                  marginRight={"$1"}
                  marginBottom={"$1"}
                  isDisabled={isConverting}
                >
                  {format}
                </Button>
              ))}
            </ButtonGroup>
          </ScrollView>
        ) : (
          <Text tx={"bookConvertScreen.noFormats"} />
        )}
      </VStack>

      {/* 変換進行状況 */}
      {isConverting && (
        <LabeledSpinner
          testID="convert-spinner"
          labelDirection="horizontal"
          labelTx={"bookConvertScreen.converting"}
        />
      )}

      {/* 変換完了メッセージ */}
      {isSuccess && (
        <Text testID="convert-success" color="$green600" tx={"bookConvertScreen.convertComplete"} />
      )}

      {/* エラーメッセージ */}
      {isError && errorMessage && (
        <Text testID="convert-error" color="$red600">
          {errorMessage}
        </Text>
      )}

      {/* 変換実行ボタン */}
      <Button
        testID="convert-button"
        tx={"bookConvertScreen.convert"}
        onPress={onConvert}
        isDisabled={!selectedFormat || isConverting}
      />
    </VStack>
  )
}
