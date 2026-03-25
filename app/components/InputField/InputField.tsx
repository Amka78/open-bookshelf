/* eslint-disable react/display-name */
import { type MessageKey, translate } from "@/i18n"
import { InputField as Template } from "@gluestack-ui/themed"
import { type ComponentProps, forwardRef } from "react"

export type InputFieldProps = ComponentProps<typeof Template> & {
  placeholderTx?: MessageKey
}

export const InputField = forwardRef<React.ElementRef<typeof Template>, InputFieldProps>(
  (props, ref) => {
    return (
      <Template
        {...props}
        placeholder={props.placeholderTx ? translate(props.placeholderTx) : props.placeholder}
        ref={ref}
      />
    )
  },
)
