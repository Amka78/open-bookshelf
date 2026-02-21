import { Button, FormRatingGroup, Heading, Text } from "@/components"
import { VStack } from "@gluestack-ui/themed"
import { useForm } from "react-hook-form"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body, CloseButton, Footer, Header, Root } from "."
import type { ModalStackParams } from "./Types"

type FormValues = {
  rating: number
}

export type ViewerRatingModalProps = ModalComponentProp<ModalStackParams, void, "ViewerRatingModal">

export function ViewerRatingModal(props: ViewerRatingModalProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      rating: props.modal.params.initialRating ?? 0,
    },
  })

  return (
    <Root>
      <Header>
        <Heading tx="modal.viewerRatingModal.title" />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <VStack space="md">
          <Text tx="modal.viewerRatingModal.message" />
          <FormRatingGroup control={form.control} name="rating" max={10} />
        </VStack>
      </Body>
      <Footer>
        <Button
          tx="common.yes"
          onPress={form.handleSubmit(async (value) => {
            await props.modal.params.onSubmit(value.rating)
            props.modal.closeModal()
          })}
        />
        <Button
          tx="common.no"
          marginLeft="$2"
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Footer>
    </Root>
  )
}
