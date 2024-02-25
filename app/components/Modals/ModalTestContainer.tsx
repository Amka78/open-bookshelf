import { useModal } from "react-native-modalfy"
import { Button, ScrollView, ButtonProps } from "@/components"
import { ModalStackParams } from "./Types"
import BookDetailFieldListStories from "../BookDetailFieldList/BookDetailFieldList.stories"
import BookImageItemStories from "../BookImageItem/BookImageItem.stories"

export function ModalLaunchButton(props: ButtonProps) {
  return <Button {...props} marginLeft={"$1"} marginBottom={"$1"} width={"$40"} />
}
export function ModalTestContainer() {

  const modal = useModal<ModalStackParams>()
  return <ScrollView contentContainerStyle={{ alignContent: "flex-start", flex: 1, flexDirection: "row", flexWrap: "wrap" }} >
    <ModalLaunchButton onPress={() => {
      modal.openModal("LoginModal", {
        onLoginPress: (loginInfo) => {
          console.log(loginInfo)
        }
      })
    }}>{"LoginModal"}</ModalLaunchButton>
    <ModalLaunchButton onPress={() => {
      modal.openModal("ConfirmModal", {
        titleTx: "modal.deleteConfirmModal.title",
        messageTx: {
          key: "modal.deleteConfirmModal.message",
          restParam: [{ key: "XXX", translate: false }]
        },
        onOKPress: () => {
          "Pressed confirm modal ok."
        }
      })
    }}>
      {"ConfirmModalTx"}
    </ModalLaunchButton>
    <ModalLaunchButton onPress={() => {
      modal.openModal("ConfirmModal", {
        title: "ConfirmModalTitleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        message: "ConfirmModalMessageXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        onOKPress: () => {
          "Pressed confirm modal ok."
        }
      })
    }}>
      {"ConfirmModal"}
    </ModalLaunchButton>
    <ModalLaunchButton onPress={
      () => {
        modal.openModal("ErrorModal", {
          titleTx: "errors.canNotConnect",
          messageTx: "errors.canNotConnectDescription",
        })
      }
    }>
      {"ErrorModalTx"}
    </ModalLaunchButton>
    <ModalLaunchButton onPress={
      () => {
        modal.openModal("ErrorModal", {
          title: "ErrorModalTitleXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          message: "ErrorModalMessageXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            + "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        })
      }
    }>
      {"ErrorModalTx"}
    </ModalLaunchButton>
    <ModalLaunchButton onPress={
      () => {
        modal.openModal("FormatSelectModal", {
          formats: ["CBZ", "PDF", "EPUB"],
          onSelectFormat: (format) => {
            console.log(format)
          }
        })
      }
    }>
      {"FormatSelectButton"}
    </ModalLaunchButton>
    <ModalLaunchButton onPress={
      () => {
        modal.openModal("BookDetailModal", {
          selectedBook: BookDetailFieldListStories.args.book,
          imageUrl: BookImageItemStories.args.source,
          fieldNameList: BookDetailFieldListStories.args.fieldNameList,
          fieldMetadataList: BookDetailFieldListStories.args.fieldMetadataList,
          onConvertBook: () => {
            console.log("Convert Book.")
          },
          onDeleteBook: () => {
            console.log("Delete Book.")
          },
          onDownloadBook: async () => {
            console.log("Download Book.")
          },
          onOpenBook: async () => {
            console.log("Open book.")
          },

        })
      }
    }>
      {"BookDetaiModal"}
    </ModalLaunchButton>
  </ ScrollView >
} 