import { type MessageKey, translate } from "@/i18n"
import {
  CheckIcon,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Checkbox as Template,
} from "@gluestack-ui/themed"
import type { ComponentProps, Ref } from "react"

export type ICheckboxProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
  ref?: Ref<React.ElementRef<typeof Template>>
}
export const Checkbox = ({ ref, ...props }: ICheckboxProps) => {
  return (
    <Template {...props} ref={ref}>
      <CheckboxLabel>{props.tx ? translate(props.tx) : props.children}</CheckboxLabel>
      <CheckboxIndicator marginLeft={"$0.5"}>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
    </Template>
  )
}
