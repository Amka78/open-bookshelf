import { type MessageKey, translate } from "@/i18n"
import type { ComponentProps, Ref } from "react"
import { Platform } from "react-native"
import { InputField as Template } from "./template"

// react-native-web の TextInput は onKeyDown を DOM の input へ転送するが、
// RN の TextInputProps には型が無いため gluestack の ComponentProps に出てこない。
// web のキー操作（Enter 確定 / Escape 取消）を型安全に扱うために明示する。
export type InputFieldKeyDownEvent = {
  key: string
  preventDefault: () => void
}

export type InputFieldProps = ComponentProps<typeof Template> & {
  placeholderTx?: MessageKey
  ref?: Ref<React.ElementRef<typeof Template>>
  onKeyDown?: (event: InputFieldKeyDownEvent) => void
}

export const InputField = ({ ref, ...props }: InputFieldProps) => {
  type TemplateOnChange = NonNullable<ComponentProps<typeof Template>["onChange"]>
  const { onChangeText, onChange: propsOnChange, placeholderTx, placeholder, ...restProps } = props

  const handleChange: TemplateOnChange = (event) => {
    propsOnChange?.(event)

    const text =
      event.nativeEvent.text ??
      (event as unknown as { target?: { value?: string } }).target?.value ??
      ""

    if (Platform.OS === "web") {
      onChangeText?.(text)
    }
  }

  const templateProps =
    Platform.OS === "web"
      ? {
          ...restProps,
          onChange: handleChange,
          onChangeText: undefined,
          ref,
        }
      : {
          ...restProps,
          onChange: handleChange,
          onChangeText,
          ref,
        }

  return (
    <Template
      {...templateProps}
      placeholder={placeholderTx ? translate(placeholderTx) ?? undefined : placeholder}
    />
  )
}
