import {
  Button,
  FormCheckbox,
  FormDateTimePicker,
  FormImageUploader,
  FormInputField,
  FormMultipleInputField,
  FormRatingGroup,
  VStack,
} from "@/components"
import { useForm } from "react-hook-form"
type FormTest = {
  checkbox: boolean
  input: string
  rating: number
  multipleInput: string[]
  datetimePicker: string
  url: string
}

type FormTestContainerProps = {
  onPressCheckForm: (value: FormTest) => void
}
export function FormTestContainer(props: FormTestContainerProps) {
  const form = useForm<FormTest, unknown, FormTest>()

  return (
    <VStack space={"md"}>
      <FormInputField control={form.control} name={"input"} />
      <FormCheckbox control={form.control} name={"checkbox"}>
        {"CheckBox"}
      </FormCheckbox>
      <FormRatingGroup control={form.control} name={"rating"} max={10} />
      <FormMultipleInputField
        control={form.control}
        name={"multipleInput"}
        valueToText={","}
        textToValue={","}
      />
      <FormDateTimePicker control={form.control} name={"datetimePicker"} />
      <FormImageUploader control={form.control} name={"url"} />
      <Button
        onPress={form.handleSubmit((value: FormTest) => {
          if (props.onPressCheckForm) {
            props.onPressCheckForm(value)
          }
        })}
        marginTop={"$1.5"}
      >
        {"Check FormInput"}
      </Button>
    </VStack>
  )
}
