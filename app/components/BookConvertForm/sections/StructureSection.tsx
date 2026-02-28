import { HStack, Text, VStack } from "@/components"
import { Switch } from "@gluestack-ui/themed"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import type { ChapterMark, ConvertOptions } from "../ConvertOptions"
import { FormSelectField } from "../FormSelectField"

type Props = {
  control: Control<ConvertOptions>
}

const chapterMarkOptions = [
  { value: "pagebreak" as ChapterMark, labelTx: "bookConvertScreen.chapterMarkPagebreak" as const },
  { value: "rule" as ChapterMark, labelTx: "bookConvertScreen.chapterMarkRule" as const },
  { value: "both" as ChapterMark, labelTx: "bookConvertScreen.chapterMarkBoth" as const },
  { value: "none" as ChapterMark, labelTx: "bookConvertScreen.chapterMarkNone" as const },
]

export function StructureSection({ control }: Props) {
  return (
    <VStack space={"sm"}>
      {/* Chapter mark */}
      <VStack>
        <Text fontSize={"$xs"} tx={"bookConvertScreen.structureChapterMark"} />
        <FormSelectField
          control={control}
          name={"structureDetection.chapterMark"}
          options={chapterMarkOptions}
        />
      </VStack>

      {/* Boolean options */}
      {(
        [
          { name: "insertMetadata", tx: "bookConvertScreen.structureInsertMetadata" },
          {
            name: "pageBreaksBeforeChapters",
            tx: "bookConvertScreen.structurePageBreaksBeforeChapters",
          },
          { name: "removeFirstImage", tx: "bookConvertScreen.structureRemoveFirstImage" },
          { name: "removeTableOfContents", tx: "bookConvertScreen.structureRemoveTOC" },
        ] as const
      ).map(({ name, tx }) => (
        <HStack key={name} justifyContent="space-between" alignItems="center">
          <Text fontSize={"$xs"} flex={1} tx={tx} />
          <Controller
            control={control}
            name={`structureDetection.${name}` as keyof ConvertOptions}
            render={({ field }) => (
              <Switch
                testID={`switch-structure-${name}`}
                value={field.value as boolean}
                onValueChange={field.onChange}
              />
            )}
          />
        </HStack>
      ))}
    </VStack>
  )
}
