import { MessageKey, translate } from "@/i18n"
import {
  Checkbox as Template,
  CheckboxLabel,
  CheckboxIndicator,
  CheckboxIcon,
  CheckIcon,
} from "@gluestack-ui/themed"
import React, { ComponentProps, forwardRef } from "react"

export type ICheckboxProps = ComponentProps<typeof Template> & {
  tx: MessageKey
}
export const Checkbox = forwardRef((props: ICheckboxProps, ref) => {
  return (
    <Template {...props} ref={ref}>
      <CheckboxLabel>{props.tx ? translate(props.tx) : props.children}</CheckboxLabel>
      <CheckboxIndicator>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
    </Template>
  )
})
