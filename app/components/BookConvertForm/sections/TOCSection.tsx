import { FormInputField, HStack, Text, VStack } from "@/components"
import { Switch } from "@gluestack-ui/themed"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import type { ConvertOptions } from "../ConvertOptions"

type Props = {
  control: Control<ConvertOptions>
}

export function TOCSection({ control }: Props) {
  return (
    <VStack space={"sm"}>
      {/* Boolean options */}
      {(
        [
          { name: "forceUseAutoTOC", tx: "bookConvertScreen.tocForceAutoTOC" },
          { name: "noInlineTOC", tx: "bookConvertScreen.tocNoInlineTOC" },
        ] as const
      ).map(({ name, tx }) => (
        <HStack key={name} justifyContent="space-between" alignItems="center">
          <Text fontSize={"$xs"} flex={1} tx={tx} />
          <Controller
            control={control}
            name={`toc.${name}` as keyof ConvertOptions}
            render={({ field }) => (
              <Switch
                testID={`switch-toc-${name}`}
                value={field.value as boolean}
                onValueChange={field.onChange}
              />
            )}
          />
        </HStack>
      ))}

      {/* Numeric options */}
      <HStack space={"sm"}>
        <VStack flex={1}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.tocMaxLinks"} />
          <FormInputField
            control={control}
            name={"toc.maxTOCLinks"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
        <VStack flex={1}>
          <Text fontSize={"$xs"} tx={"bookConvertScreen.tocNumberOfHeadings"} />
          <FormInputField
            control={control}
            name={"toc.numberOfHeadingsForAutoTOC"}
            keyboardType="numeric"
            width={"$full"}
          />
        </VStack>
      </HStack>
    </VStack>
  )
}
