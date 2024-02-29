import { MessageKey, translate } from "@/i18n"
import {
  Checkbox as Template,
  CheckboxLabel,
  CheckboxIndicator,
  CheckboxIcon,
  CheckIcon,
} from "@gluestack-ui/themed"
import React, { ComponentProps, forwardRef, Ref } from "react"
import { View } from "react-native"

export type ICheckboxProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export const Checkbox = forwardRef((props: ICheckboxProps, ref: Ref<View>) => {
  return (
    <Template {...props} ref={ref} >
      <CheckboxLabel>{props.tx ? translate(props.tx) : props.children}</CheckboxLabel>
      <CheckboxIndicator marginLeft={"$0.5"}>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
    </Template>
  )
})
