import { type MessageKey, translate } from "@/i18n"
import { InputField as Template } from "@gluestack-ui/themed"
import type { ComponentProps, Ref } from "react"

export type InputFieldProps = ComponentProps<typeof Template> & {
  placeholderTx?: MessageKey
  ref?: Ref<React.ElementRef<typeof Template>>
}

export const InputField = ({ ref, ...props }: InputFieldProps) => {
  return (
    <Template
      {...props}
      placeholder={props.placeholderTx ? translate(props.placeholderTx) : props.placeholder}
      ref={ref}
    />
  )
}
