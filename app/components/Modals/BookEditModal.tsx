import { Button, HStack, Heading, FormImageUploader, BookEditFieldList } from "@/components"
import { ModalComponentProp } from "react-native-modalfy"

import { Body, CloseButton, Header, Root, Footer } from "."
import { ModalStackParams } from "./Types"
import { Metadata } from "@/models/calibre"
import { useForm, Control } from "react-hook-form"

export type BookEditModalProps = ModalComponentProp<ModalStackParams, void, "BookEditModal">

type MetadataWithImage = Metadata & { image: string }

export function BookEditModalTemplate(props: BookEditModalProps) {
  const form = useForm<MetadataWithImage, unknown, MetadataWithImage>({
    defaultValues: props.modal.params.selectedBook.metaData,
  })
  return (
    <Root>
      <Header>
        <Heading isTruncated={true} tx={"modal.bookEditModal.title"} />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <HStack space={"sm"}>
          <FormImageUploader
            control={form.control}
            name={"image"}
            defaultValue={props.modal.params.imageUrl}
          />
          <BookEditFieldList
            book={props.modal.params.selectedBook}
            control={form.control as Control<Metadata, unknown>}
            fieldMetadataList={props.modal.params.fieldMetadataList}
            height={320}
            width={240}
          />
        </HStack>
      </Body>
      <Footer>
        <Button
          onPress={form.handleSubmit(() => {
            if (props.modal.params.onOKPress) {
              props.modal.params.onOKPress()
            }
            props.modal.closeModal()
          })}
          tx={"common.ok"}
        />
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.cancel"}
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
}
