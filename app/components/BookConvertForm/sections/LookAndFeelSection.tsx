import { FormCheckbox, HStack, Text, VStack } from "@/components"
import { FormInputField } from "@/components"
import { Switch } from "@gluestack-ui/themed"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import type { ConvertOptions } from "../ConvertOptions"
import type { TextJustification } from "../ConvertOptions"
import { FormSelectField } from "../FormSelectField"

type Props = {
  control: Control<ConvertOptions>
}

const justificationOptions = [
  { value: "left" as TextJustification, labelTx: "bookConvertScreen.justifyLeft" as const },
  { value: "right" as TextJustification, labelTx: "bookConvertScreen.justifyRight" as const },
  { value: "center" as TextJustification, labelTx: "bookConvertScreen.justifyCenter" as const },
  { value: "justify" as TextJustification, labelTx: "bookConvertScreen.justifyJustify" as const },
]

export function LookAndFeelSection({ control }: Props) {
  return (
    <VStack space={"sm"}>
      {/* Margins */}
      <HStack space={"sm"} flexWrap="wrap">
        <VStack flex={1} minWidth={"$24"}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.marginTop"} />
          <FormInputField
            control={control}
            name={"lookAndFeel.marginTop"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
        <VStack flex={1} minWidth={"$24"}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.marginBottom"} />
          <FormInputField
            control={control}
            name={"lookAndFeel.marginBottom"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
        <VStack flex={1} minWidth={"$24"}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.marginLeft"} />
          <FormInputField
            control={control}
            name={"lookAndFeel.marginLeft"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
        <VStack flex={1} minWidth={"$24"}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.marginRight"} />
          <FormInputField
            control={control}
            name={"lookAndFeel.marginRight"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
      </HStack>

      {/* Text Justification */}
      <VStack>
        <Text fontSize={"$xs"} tx={"bookConvertScreen.textJustification"} />
        <FormSelectField
          control={control}
          name={"lookAndFeel.textJustification"}
          options={justificationOptions}
          placeholder={"(default)"}
        />
      </VStack>

      {/* Font settings */}
      <HStack space={"sm"} flexWrap="wrap">
        <VStack flex={1} minWidth={"$24"}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.baseFontSize"} />
          <FormInputField
            control={control}
            name={"lookAndFeel.baseFontSize"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
        <VStack flex={1} minWidth={"$24"}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.lineHeight"} />
          <FormInputField
            control={control}
            name={"lookAndFeel.lineHeight"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
      </HStack>

      {/* Encoding */}
      <VStack>
        <Text fontSize={"$xs"} tx={"bookConvertScreen.inputEncoding"} />
        <FormInputField
          control={control}
          name={"lookAndFeel.inputEncoding"}
          placeholder={"utf-8"}
          width={"$full"}
        />
      </VStack>

      {/* Boolean options */}
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize={"$xs"} flex={1} tx={"bookConvertScreen.disableFontRescaling"} />
        <Controller
          control={control}
          name={"lookAndFeel.disableFontRescaling"}
          render={({ field }) => (
            <Switch
              testID="switch-disableFontRescaling"
              value={field.value as boolean}
              onValueChange={field.onChange}
            />
          )}
        />
      </HStack>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize={"$xs"} flex={1} tx={"bookConvertScreen.removeASCIIReplacements"} />
        <Controller
          control={control}
          name={"lookAndFeel.removeASCIIReplacements"}
          render={({ field }) => (
            <Switch
              testID="switch-removeASCIIReplacements"
              value={field.value as boolean}
              onValueChange={field.onChange}
            />
          )}
        />
      </HStack>
    </VStack>
  )
}
