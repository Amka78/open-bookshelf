import { type MessageKey, translate } from "@/i18n"
import { InputField as Template } from "@gluestack-ui/themed"
import type { ChangeEvent, ComponentProps, Ref } from "react"
import { useCallback, useEffect, useRef } from "react"
import { Platform } from "react-native"

export type InputFieldProps = ComponentProps<typeof Template> & {
  placeholderTx?: MessageKey
  ref?: Ref<React.ElementRef<typeof Template>>
}

export const InputField = ({ ref, ...props }: InputFieldProps) => {
  type TemplateElement = React.ElementRef<typeof Template>
  type WebChangeEvent = ChangeEvent<HTMLInputElement> & {
    nativeEvent?: {
      text?: string
    }
  }
  const {
    onChangeText,
    onChange: propsOnChange,
    placeholderTx,
    placeholder,
    ...restProps
  } = props
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

  // On web, ensure onChange properly wires to both onChangeText and any onChange handler
  const handleChange = useCallback(
    (e: WebChangeEvent) => {
      const text = e?.target?.value ?? e?.nativeEvent?.text ?? ""
      propsOnChange?.(e)
      onChangeText?.(text)
    },
    [propsOnChange, onChangeText],
  )

  // On web, also listen to onInput event which fires more reliably
  useEffect(() => {
    if (Platform.OS !== "web") return
    const inputEl = inputRef.current
    if (!inputEl) return

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target && typeof target.value === "string") {
        onChangeText?.(target.value)
      }
    }

    inputEl.addEventListener("input", handleInput)
    return () => {
      inputEl.removeEventListener("input", handleInput)
    }
  }, [onChangeText])

  const templateProps =
    Platform.OS === "web"
      ? {
          ...restProps,
          onChange: handleChange,
          ref: assignRef,
        }
      : {
          ...restProps,
          onChange: propsOnChange,
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
