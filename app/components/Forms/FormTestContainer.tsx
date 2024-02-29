import { useForm } from "react-hook-form";
import { Button, FormCheckbox, FormInputField, FormMultipleInputField, FormRatingGroup, VStack } from "@/components"
type FormTest = {
  checkbox: boolean,
  input: string,
  rating: number,
  multipleInput: string[]
}

type FormTestContainerProps = {
  onPressCheckForm: (value: FormTest) => void
}
export function FormTestContainer(props: FormTestContainerProps) {

  const form = useForm<FormTest, unknown, FormTest>()

  return <VStack space={"md"} >
    <FormInputField control={form.control} name={"input"} />
    <FormCheckbox control={form.control} name={"checkbox"} >{
      "CheckBox"
    }</FormCheckbox>
    <FormRatingGroup control={form.control} name={"rating"} max={10} />
    <FormMultipleInputField control={form.control} name={"multipleInput"} valueToText={","} textToValue={","} />
    <Button onPress={form.handleSubmit((value: FormTest) => {
      if (props.onPressCheckForm) {
        props.onPressCheckForm(value)
      }
    })} marginTop={"$1.5"} >{"Check FormInput"}</Button>
  </VStack >
}