import { useForm } from "react-hook-form";
import { Button, FormCheckbox, FormInputField, FormRatingGroup, VStack } from "@/components"
type FormTest = {
  checkbox: boolean,
  input: string,
  rating: number
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
    <Button onPress={form.handleSubmit((value: FormTest) => {
      if (props.onPressCheckForm) {
        props.onPressCheckForm(value)
      }
    })} marginTop={"$1.5"} >{"Check FormInput"}</Button>
  </VStack >
}