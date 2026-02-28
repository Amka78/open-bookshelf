import { HStack, Text, VStack } from "@/components"
import { Switch } from "@gluestack-ui/themed"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import type {
  ConvertOptions,
  EPUBVersion,
  MobiFileType,
  PDFOrientation,
  PDFPaperSize,
  PDFUnit,
} from "../ConvertOptions"
import { FormSelectField } from "../FormSelectField"

type Props = {
  control: Control<ConvertOptions>
  outputFormat: string
}

const epubVersionOptions = [
  { value: "2" as EPUBVersion, labelTx: "bookConvertScreen.epubVersion2" as const },
  { value: "3" as EPUBVersion, labelTx: "bookConvertScreen.epubVersion3" as const },
]

const mobiFileTypeOptions = [
  { value: "old" as MobiFileType, labelTx: "bookConvertScreen.mobiOld" as const },
  { value: "new" as MobiFileType, labelTx: "bookConvertScreen.mobiNew" as const },
  { value: "both" as MobiFileType, labelTx: "bookConvertScreen.mobiBoth" as const },
]

const pdfPaperSizeOptions: { value: PDFPaperSize; label: string }[] = [
  { value: "a3", label: "A3" },
  { value: "a4", label: "A4" },
  { value: "a5", label: "A5" },
  { value: "a6", label: "A6" },
  { value: "b4", label: "B4" },
  { value: "b5", label: "B5" },
  { value: "letter", label: "Letter" },
  { value: "legal", label: "Legal" },
  { value: "executive", label: "Executive" },
]

const pdfOrientationOptions = [
  { value: "portrait" as PDFOrientation, labelTx: "bookConvertScreen.pdfPortrait" as const },
  { value: "landscape" as PDFOrientation, labelTx: "bookConvertScreen.pdfLandscape" as const },
]

const pdfUnitOptions: { value: PDFUnit; label: string }[] = [
  { value: "pt", label: "pt" },
  { value: "mm", label: "mm" },
  { value: "inch", label: "inch" },
]

export function OutputSection({ control, outputFormat }: Props) {
  const fmt = outputFormat?.toUpperCase()
  const isEPUB = fmt === "EPUB"
  const isMOBI = fmt === "MOBI" || fmt === "AZW3" || fmt === "KF8"
  const isPDF = fmt === "PDF"

  if (!isEPUB && !isMOBI && !isPDF) {
    return (
      <Text fontSize={"$xs"} color={"$coolGray500"}>
        {`No format-specific options for ${outputFormat || "—"}`}
      </Text>
    )
  }

  return (
    <VStack space={"sm"}>
      {isEPUB && (
        <>
          <VStack>
            <Text fontSize={"$xs"} tx={"bookConvertScreen.epubVersion"} />
            <FormSelectField
              control={control}
              name={"outputEPUB.epubVersion"}
              options={epubVersionOptions}
            />
          </VStack>
          {(
            [
              { name: "preserveCoverAspectRatio", tx: "bookConvertScreen.epubPreserveCoverAspect" },
              { name: "noDefaultCover", tx: "bookConvertScreen.epubNoDefaultCover" },
              { name: "noSVGCover", tx: "bookConvertScreen.epubNoSVGCover" },
              { name: "flattenFiles", tx: "bookConvertScreen.epubFlattenFiles" },
            ] as const
          ).map(({ name, tx }) => (
            <HStack key={name} justifyContent="space-between" alignItems="center">
              <Text fontSize={"$xs"} flex={1} tx={tx} />
              <Controller
                control={control}
                name={`outputEPUB.${name}` as keyof ConvertOptions}
                render={({ field }) => (
                  <Switch
                    testID={`switch-epub-${name}`}
                    value={field.value as boolean}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </HStack>
          ))}
        </>
      )}

      {isMOBI && (
        <>
          <VStack>
            <Text fontSize={"$xs"} tx={"bookConvertScreen.mobiFileType"} />
            <FormSelectField
              control={control}
              name={"outputMOBI.mobiFileType"}
              options={mobiFileTypeOptions}
            />
          </VStack>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize={"$xs"} flex={1}>
              {"No inline table"}
            </Text>
            <Controller
              control={control}
              name={"outputMOBI.noInlineTable"}
              render={({ field }) => (
                <Switch
                  testID="switch-mobi-noInlineTable"
                  value={field.value as boolean}
                  onValueChange={field.onChange}
                />
              )}
            />
          </HStack>
        </>
      )}

      {isPDF && (
        <>
          <VStack>
            <Text fontSize={"$xs"} tx={"bookConvertScreen.pdfPaperSize"} />
            <FormSelectField
              control={control}
              name={"outputPDF.paperSize"}
              options={pdfPaperSizeOptions}
            />
          </VStack>
          <VStack>
            <Text fontSize={"$xs"} tx={"bookConvertScreen.pdfOrientation"} />
            <FormSelectField
              control={control}
              name={"outputPDF.orientation"}
              options={pdfOrientationOptions}
            />
          </VStack>
          <VStack>
            <Text fontSize={"$xs"} tx={"bookConvertScreen.pdfUnit"} />
            <FormSelectField
              control={control}
              name={"outputPDF.unit"}
              options={pdfUnitOptions}
              width={"$32"}
            />
          </VStack>
        </>
      )}
    </VStack>
  )
}
