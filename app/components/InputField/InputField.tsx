import { type MessageKey, translate } from "@/i18n"
import { InputField as Template } from "@gluestack-ui/themed"
import type { ComponentProps, Ref } from "react"
import { useCallback, useEffect, useRef } from "react"
import { Platform } from "react-native"

export type InputFieldProps = ComponentProps<typeof Template> & {
  placeholderTx?: MessageKey
  ref?: Ref<React.ElementRef<typeof Template>>
}

export const InputField = ({ ref, ...props }: InputFieldProps) => {
  const { onChangeText, onChange: propsOnChange, ...restProps } = props
  const inputRef = useRef<any>(null)

  // On web, ensure onChange properly wires to both onChangeText and any onChange handler
  const handleChange = useCallback(
    (e: any) => {
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

  const webProps =
    Platform.OS === "web"
      ? {
          onChange: handleChange,
          ref: (el: any) => {
            inputRef.current = el
            if (typeof ref === "function") {
              ref(el)
            } else if (ref) {
              ;(ref as any).current = el
            }
          },
        }
      : { ref }

  return (
    <Template
      {...restProps}
      {...webProps}
      placeholder={props.placeholderTx ? translate(props.placeholderTx) : props.placeholder}
    />
  )
}
