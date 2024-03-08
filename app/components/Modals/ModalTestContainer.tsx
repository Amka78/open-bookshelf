import { useModal } from "react-native-modalfy"
import { Button, ScrollView, ButtonProps } from "@/components"
import { ModalStackParams } from "./Types"
import { Base as BookDetailFieldListStories } from "../BookDetailFieldList/BookDetailFieldList.stories"
import BookImageItemStories from "../BookImageItem/BookImageItem.stories"

export function ModalLaunchButton(props: ButtonProps) {
  return <Button {...props} marginLeft={"$1"} marginBottom={"$1"} width={"$40"} />
}

export type ModalTestContainerProp = {
  onLoginPress: () => void | Promise<void>
  onOKPress: () => void | Promise<void>
  onSelectFormat: () => void | Promise<void>
  onConvertBook: () => void | Promise<void>
  onDeleteBook: () => void | Promise<void>
  onDownloadBook: () => void | Promise<void>
  onOpenBook: () => void | Promise<void>
}
export function ModalTestContainer(props: ModalTestContainerProp) {
  const modal = useModal<ModalStackParams>()
  return (
    <ScrollView
      contentContainerStyle={{
        alignContent: "flex-start",
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("LoginModal", {
            onLoginPress: props.onLoginPress,
          })
        }}
      >
        {"LoginModal"}
      </ModalLaunchButton>
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("ConfirmModal", {
            titleTx: "modal.deleteConfirmModal.title",
            messageTx: {
              key: "modal.deleteConfirmModal.message",
              restParam: [{ key: "XXX", translate: false }],
            },
            onOKPress: props.onOKPress,
          })
        }}
      >
        {"ConfirmModalTx"}
      </ModalLaunchButton>
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("ConfirmModal", {
            title: "ConfirmModalTitleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            message:
              "ConfirmModalMessageXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            onOKPress: props.onOKPress,
          })
        }}
      >
        {"ConfirmModal"}
      </ModalLaunchButton>
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("ErrorModal", {
            titleTx: "errors.canNotConnect",
            messageTx: "errors.canNotConnectDescription",
          })
        }}
      >
        {"ErrorModalTx"}
      </ModalLaunchButton>
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("ErrorModal", {
            title: "ErrorModalTitleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            message:
              "ErrorModalMessageXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" +
              "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          })
        }}
      >
        {"ErrorModalTx"}
      </ModalLaunchButton>
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("FormatSelectModal", {
            formats: ["CBZ", "PDF", "EPUB"],
            onSelectFormat: props.onSelectFormat,
          })
        }}
      >
        {"FormatSelectButton"}
      </ModalLaunchButton>
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("BookDetailModal", {
            selectedBook: BookDetailFieldListStories.args.book,
            imageUrl: BookImageItemStories.args.source as string,
            fieldNameList: BookDetailFieldListStories.args.fieldNameList,
            fieldMetadataList: BookDetailFieldListStories.args.fieldMetadataList,
            onConvertBook: props.onConvertBook,
            onDeleteBook: props.onDeleteBook,
            onDownloadBook: props.onDownlaodBook,
            onOpenBook: props.onOpenBook,
          })
        }}
      >
        {"BookDetaiModal"}
      </ModalLaunchButton>
      <ModalLaunchButton
        onPress={() => {
          modal.openModal("BookEditModal", {
            selectedBook: BookDetailFieldListStories.args.book,
            imageUrl: BookImageItemStories.args.source,
            fieldMetadataList: BookDetailFieldListStories.args.fieldMetadataList,
            onOKPress: props.onOKPress,
          })
        }}
      >
        {"BookEditModal"}
      </ModalLaunchButton>
    </ScrollView>
  )
}
