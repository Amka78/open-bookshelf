import { type MessageKey, translate } from "@/i18n"
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
} from "@gluestack-ui/themed"
import { ChevronDownIcon } from "@gluestack-ui/themed"
import { Controller, type ControllerProps } from "react-hook-form"

export type SelectOption<T extends string = string> = {
  value: T
  labelTx?: MessageKey
  label?: string
}

export type FormSelectFieldProps<TForm, TValue extends string = string> = Omit<
  ControllerProps<TForm>,
  "render"
> & {
  options: SelectOption<TValue>[]
  placeholderTx?: MessageKey
  placeholder?: string
  width?: number | string
}

export function FormSelectField<TForm, TValue extends string = string>(
  props: FormSelectFieldProps<TForm, TValue>,
) {
  const { control, name, rules, shouldUnregister, defaultValue, disabled, options, width } = props

  const placeholder = props.placeholderTx ? translate(props.placeholderTx) : props.placeholder

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      shouldUnregister={shouldUnregister}
      defaultValue={defaultValue}
      disabled={disabled}
      render={({ field }) => (
        <Select
          selectedValue={field.value as string}
          onValueChange={(val) => field.onChange(val)}
          isDisabled={disabled}
        >
          <SelectTrigger variant="outline" size="md" width={width ?? "$full"}>
            <SelectInput placeholder={placeholder} />
            <SelectIcon marginRight={"$3"} as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <SelectScrollView>
                {options.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    label={opt.labelTx ? translate(opt.labelTx) : opt.label ?? opt.value}
                    value={opt.value}
                  />
                ))}
              </SelectScrollView>
            </SelectContent>
          </SelectPortal>
        </Select>
      )}
    />
  )
}
