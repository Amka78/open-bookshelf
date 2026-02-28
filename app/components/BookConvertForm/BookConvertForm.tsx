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
import { OutputSection } from "./sections/OutputSection"
import { StructureSection } from "./sections/StructureSection"
import { TOCSection } from "./sections/TOCSection"

export type ConvertStatus = "idle" | "converting" | "success" | "error"

export type BookConvertFormProps = {
  /** 利用可能なフォーマット一覧 */
  formats: string[]
  /** react-hook-form control */
  control: Control<ConvertOptions>
  /** watch for outputFormat to show format-specific section */
  watch: UseFormWatch<ConvertOptions>
  /** 変換処理状態 */
  convertStatus: ConvertStatus
  /** エラーメッセージ */
  errorMessage: string | null
  /** 変換実行コールバック */
  onConvert: () => void
}

export function BookConvertForm(props: BookConvertFormProps) {
  const { formats, control, watch, convertStatus, errorMessage, onConvert } = props

  const isConverting = convertStatus === "converting"
  const isSuccess = convertStatus === "success"
  const isError = convertStatus === "error"

  const outputFormat = watch("outputFormat") ?? ""

  return (
    <VStack space={"sm"} flex={1}>
      {/* ===== 変換元フォーマット表示 ===== */}
      <VStack space={"xs"}>
        <Text fontWeight="$bold" tx={"bookConvertScreen.inputFormat"} />
        <Text>
          {formats.length > 0 ? formats.join(", ") : translate("bookConvertScreen.noFormats")}
        </Text>
      </VStack>

      {/* ===== 変換先フォーマット選択 ===== */}
      <VStack space={"xs"}>
        <Text fontWeight="$bold" tx={"bookConvertScreen.outputFormat"} />
        {formats.length > 0 ? (
          <Controller
            control={control}
            name={"outputFormat"}
            render={({ field }) => (
              <ButtonGroup flexDirection="row" flexWrap="wrap">
                {formats.map((format) => (
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
        <Accordion variant="filled" type="multiple" isCollapsible testID="convert-accordion">
          {/* --- Look & Feel --- */}
          <AccordionItem value="lookAndFeel">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText tx={"bookConvertScreen.sectionLookAndFeel"} />
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
          <AccordionItem value="heuristics">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText tx={"bookConvertScreen.sectionHeuristics"} />
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
          <AccordionItem value="structure">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText tx={"bookConvertScreen.sectionStructure"} />
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
          <AccordionItem value="toc">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText tx={"bookConvertScreen.sectionTOC"} />
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
          <AccordionItem value="output">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: boolean }) => (
                  <>
                    <AccordionTitleText tx={"bookConvertScreen.sectionOutput"} />
                    <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
                  </>
                )}
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>
              <OutputSection control={control} outputFormat={outputFormat} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollView>

      {/* ===== 変換進行状況 / 結果 ===== */}
      {isConverting && (
        <LabeledSpinner
          testID="convert-spinner"
          labelDirection="horizontal"
          labelTx={"bookConvertScreen.converting"}
        />
      )}
      {isSuccess && (
        <Text testID="convert-success" color="$green600" tx={"bookConvertScreen.convertComplete"} />
      )}
      {isError && errorMessage && (
        <Text testID="convert-error" color="$red600">
          {errorMessage}
        </Text>
      )}

      {/* ===== 変換実行ボタン ===== */}
      <Button
        testID="convert-button"
        tx={"bookConvertScreen.convert"}
        onPress={onConvert}
        isDisabled={!outputFormat || isConverting}
      />
    </VStack>
  )
}
