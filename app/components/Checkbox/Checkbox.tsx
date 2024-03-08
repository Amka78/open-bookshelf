import { type MessageKey, translate } from "@/i18n"
import {
  CheckIcon,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Checkbox as Template,
} from "@gluestack-ui/themed"
import React, { type ComponentProps, forwardRef, type Ref } from "react"
import type { View } from "react-native"

export type ICheckboxProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export const Checkbox = forwardRef((props: ICheckboxProps, ref: Ref<View>) => {
  return (
    <Template {...props} ref={ref}>
      <CheckboxLabel>{props.tx ? translate(props.tx) : props.children}</CheckboxLabel>
      <CheckboxIndicator marginLeft={"$0.5"}>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
    </Template>
  )
})
