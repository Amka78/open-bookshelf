import { type MessageKey, translate } from "@/i18n"
import type { ComponentProps, Ref } from "react"
import { useCallback, useRef } from "react"
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
  type TemplateElement = React.ElementRef<typeof Template>
  type TemplateOnChange = NonNullable<ComponentProps<typeof Template>["onChange"]>
  const { onChangeText, onChange: propsOnChange, placeholderTx, placeholder, ...restProps } = props
  const inputRef = useRef<TemplateElement | null>(null)

  const assignRef = useCallback(
    (element: TemplateElement | null) => {
      inputRef.current = element

      if (typeof ref === "function") {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
    },
    [ref],
  )

  const handleChange = useCallback<TemplateOnChange>(
    (event) => {
      propsOnChange?.(event)

      const text =
        event.nativeEvent.text ??
        (event as unknown as { target?: { value?: string } }).target?.value ??
        ""

      if (Platform.OS === "web") {
        onChangeText?.(text)
      }
    },
    [propsOnChange, onChangeText],
  )

  const templateProps =
    Platform.OS === "web"
      ? {
          ...restProps,
          onChange: handleChange,
          onChangeText: undefined,
          ref: assignRef,
        }
      : {
          ...restProps,
          onChange: handleChange,
          onChangeText,
          ref: assignRef,
        }

  return (
    <Template
      {...templateProps}
      placeholder={placeholderTx ? translate(placeholderTx) : placeholder}
    />
  )
}
