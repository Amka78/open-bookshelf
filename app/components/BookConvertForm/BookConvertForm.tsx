import { Button, LabeledSpinner, ScrollView, Text, VStack } from "@/components"
import { translate } from "@/i18n"
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
  ButtonGroup,
  ChevronDownIcon,
  ChevronUpIcon,
  Icon,
} from "@gluestack-ui/themed"
import { type Control, Controller, type UseFormWatch } from "react-hook-form"
import type { ConvertOptions } from "./ConvertOptions"
import { HeuristicsSection } from "./sections/HeuristicsSection"
import { LookAndFeelSection } from "./sections/LookAndFeelSection"
import { hasOutputFormatSpecificOptions, OutputSection } from "./sections/OutputSection"
import { StructureSection } from "./sections/StructureSection"
import { TOCSection } from "./sections/TOCSection"

export type ConvertStatus = "idle" | "converting" | "success" | "error"

export type BookConvertFormProps = {
  /** 入力元フォーマット一覧 (選択中の書籍が持つフォーマット) */
  inputFormats: string[]
  /** 出力先フォーマット一覧 (Calibre が変換可能なフォーマット) */
  outputFormats: string[]
  /** react-hook-form control */
  control: Control<ConvertOptions>
  /** watch for outputFormat to show format-specific section */
  watch: UseFormWatch<ConvertOptions>
  /** 変換処理状態 */
  convertStatus: ConvertStatus
  /** エラーメッセージ */
  errorMessage: string | null
}

export function BookConvertForm(props: BookConvertFormProps) {
  const { inputFormats, outputFormats, control, watch, convertStatus, errorMessage } = props

  const isConverting = convertStatus === "converting"
  const isSuccess = convertStatus === "success"
  const isError = convertStatus === "error"

  const outputFormat = watch("outputFormat") ?? ""
  const showOutputOptions = hasOutputFormatSpecificOptions(outputFormat)

  return (
    <VStack space={"sm"} flex={1}>
      {/* ===== 変換元フォーマット表示 ===== */}
      <VStack space={"xs"}>
        <Text fontWeight="$bold" tx={"bookConvertScreen.inputFormat"} />
        <Text>
          {inputFormats.length > 0
            ? inputFormats.join(", ")
            : translate("bookConvertScreen.noFormats")}
        </Text>
      </VStack>

      {/* ===== 変換先フォーマット選択 ===== */}
      <VStack space={"xs"}>
        <Text fontWeight="$bold" tx={"bookConvertScreen.outputFormat"} />
        {outputFormats.length > 0 ? (
          <Controller
            control={control}
            name={"outputFormat"}
            render={({ field }) => (
              <ButtonGroup flexDirection="row" flexWrap="wrap">
                {outputFormats.map((format) => (
                  <Button
                    key={format}
                    testID={`format-button-${format}`}
                    variant={field.value === format ? "solid" : "outline"}
                    onPress={() => field.onChange(format)}
                    marginRight={"$1"}
                    marginBottom={"$1"}
                    isDisabled={isConverting}
                  >
                    {format}
                  </Button>
                ))}
              </ButtonGroup>
            )}
          />
        ) : (
          <Text tx={"bookConvertScreen.noFormats"} />
        )}
      </VStack>

      {/* ===== 詳細設定 (Accordion) ===== */}
      <ScrollView flex={1} nestedScrollEnabled>
        <Accordion
          variant="filled"
          type="multiple"
          isCollapsible
          testID="convert-accordion"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="flex-start"
          gap="$2"
        >
          {/* --- Look & Feel --- */}
          <AccordionItem value="lookAndFeel" flex={1} minWidth={"$80"} alignSelf="flex-start">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText>
                      {translate("bookConvertScreen.sectionLookAndFeel")}
                    </AccordionTitleText>
                    <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                  </>
                )}
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>
              <LookAndFeelSection control={control} />
            </AccordionContent>
          </AccordionItem>

          {/* --- Heuristic Processing --- */}
          <AccordionItem value="heuristics" flex={1} minWidth={"$80"} alignSelf="flex-start">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText>
                      {translate("bookConvertScreen.sectionHeuristics")}
                    </AccordionTitleText>
                    <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                  </>
                )}
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>
              <HeuristicsSection control={control} />
            </AccordionContent>
          </AccordionItem>

          {/* --- Structure Detection --- */}
          <AccordionItem value="structure" flex={1} minWidth={"$80"} alignSelf="flex-start">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText>
                      {translate("bookConvertScreen.sectionStructure")}
                    </AccordionTitleText>
                    <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                  </>
                )}
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>
              <StructureSection control={control} />
            </AccordionContent>
          </AccordionItem>

          {/* --- Table of Contents --- */}
          <AccordionItem value="toc" flex={1} minWidth={"$80"} alignSelf="flex-start">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText>
                      {translate("bookConvertScreen.sectionTOC")}
                    </AccordionTitleText>
                    <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                  </>
                )}
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>
              <TOCSection control={control} />
            </AccordionContent>
          </AccordionItem>

          {/* --- Output Format Specific --- */}
          {showOutputOptions && (
            <AccordionItem value="output" flex={1} minWidth={"$80"} alignSelf="flex-start">
              <AccordionHeader>
                <AccordionTrigger>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <AccordionTitleText>
                        {translate("bookConvertScreen.sectionOutput")}
                      </AccordionTitleText>
                      <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                    </>
                  )}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <OutputSection control={control} outputFormat={outputFormat} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </ScrollView>

      {/* ===== 変換進行状況 / 結果 ===== */}
      {isConverting && (
        <LabeledSpinner labelDirection="horizontal" labelTx={"bookConvertScreen.converting"} />
      )}
      {isSuccess && (
        <Text testID="convert-success" color="$green600" tx={"bookConvertScreen.convertComplete"} />
      )}
      {isError && errorMessage && (
        <Text testID="convert-error" color="$red600">
          {errorMessage}
        </Text>
      )}
    </VStack>
  )
}
