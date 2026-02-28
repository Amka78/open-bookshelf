import { HStack, Text, VStack } from "@/components"
import { Switch } from "@gluestack-ui/themed"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import type { ConvertOptions } from "../ConvertOptions"

type Props = {
  control: Control<ConvertOptions>
}

type SwitchRowProps = {
  control: Control<ConvertOptions>
  name: keyof ConvertOptions["heuristics"] & string
  labelTx: Parameters<typeof Text>[0]["tx"]
  testID?: string
  disabled?: boolean
}

function SwitchRow({ control, name, labelTx, testID, disabled }: SwitchRowProps) {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Text fontSize={"$xs"} flex={1} tx={labelTx} />
      <Controller
        control={control}
        name={`heuristics.${name}` as keyof ConvertOptions}
        render={({ field }) => (
          <Switch
            testID={testID ?? `switch-heuristics-${name}`}
            value={field.value as boolean}
            onValueChange={field.onChange}
            isDisabled={disabled}
          />
        )}
      />
    </HStack>
  )
}

export function HeuristicsSection({ control }: Props) {
  return (
    <VStack space={"sm"}>
      <SwitchRow
        control={control}
        name={"enabled"}
        labelTx={"bookConvertScreen.heuristicsEnabled"}
        testID="switch-heuristics-enabled"
      />

      <Controller
        control={control}
        name={"heuristics.enabled"}
        render={({ field: { value: heuristicsEnabled } }) => (
          <VStack space={"sm"} opacity={heuristicsEnabled ? 1 : 0.4}>
            <SwitchRow
              control={control}
              name={"unwrapLines"}
              labelTx={"bookConvertScreen.heuristicsUnwrapLines"}
              disabled={!heuristicsEnabled}
            />
            <SwitchRow
              control={control}
              name={"deleteBlankLines"}
              labelTx={"bookConvertScreen.heuristicsDeleteBlankLines"}
              disabled={!heuristicsEnabled}
            />
            <SwitchRow
              control={control}
              name={"formatSceneBreaks"}
              labelTx={"bookConvertScreen.heuristicsFormatSceneBreaks"}
              disabled={!heuristicsEnabled}
            />
            <SwitchRow
              control={control}
              name={"renumberHeadings"}
              labelTx={"bookConvertScreen.heuristicsRenumberHeadings"}
              disabled={!heuristicsEnabled}
            />
            <SwitchRow
              control={control}
              name={"detectItalics"}
              labelTx={"bookConvertScreen.heuristicsDetectItalics"}
              disabled={!heuristicsEnabled}
            />
          </VStack>
        )}
      />
    </VStack>
  )
}
