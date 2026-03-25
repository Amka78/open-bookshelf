import { type MessageKey, translate } from "@/i18n"
import {
  CheckIcon,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Checkbox as Template,
} from "@gluestack-ui/themed"
import { type ComponentProps, forwardRef } from "react"

export type ICheckboxProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export const Checkbox = forwardRef<React.ElementRef<typeof Template>, ICheckboxProps>(
  (props, ref) => {
    return (
      <Template {...props} ref={ref}>
        <CheckboxLabel>{props.tx ? translate(props.tx) : props.children}</CheckboxLabel>
        <CheckboxIndicator marginLeft={"$0.5"}>
          <CheckboxIcon as={CheckIcon} />
        </CheckboxIndicator>
      </Template>
    )
  },
)
