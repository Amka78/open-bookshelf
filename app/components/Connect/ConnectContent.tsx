import { Button, FormCheckbox, FormInputField, Input, VStack } from "@/components"
import type { ConnectType } from "@/type/types"
import type { ComponentProps } from "react"
import type { Control } from "react-hook-form"

export type ConnectContentProps = {
  control: Control<ConnectType, unknown>
  baseUrl: string
  onSubmit: () => void
  submitDisabled?: boolean
  containerProps?: ComponentProps<typeof VStack>
}

export function ConnectContent({
  control,
  baseUrl,
  onSubmit,
  submitDisabled,
  containerProps,
}: ConnectContentProps) {
  return (
    <VStack space="md" testID="connect-content" {...containerProps}>
      <FormCheckbox
        name={"isOPDS"}
        tx={"connectScreen.checkbox"}
        control={control}
        aria-label={"isOPDS"}
      />
      <Input>
        <FormInputField
          control={control}
          defaultValue={baseUrl}
          placeholderTx={"connectScreen.placeHolder"}
          rules={{ required: true }}
          name={"url"}
        />
      </Input>
      <Button
        isDisabled={submitDisabled}
        testID="connect-button"
        tx="connectScreen.connect"
        onPress={onSubmit}
        width={"$full"}
      />
    </VStack>
  )
}
