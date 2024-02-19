import { IconButton } from "@/components"
import * as DocumentPicker from "expo-document-picker"

export type AddFileButtonProps = {
  onDocumentSelect: (document: DocumentPicker.DocumentPickerAsset[]) => Promise<void>
}

export function AddFileButton(props: AddFileButtonProps) {
  return (
    <IconButton
      iconSize="md-"
      name="plus"
      onPress={async () => {
        const docRes: DocumentPicker.DocumentPickerResult = await DocumentPicker.getDocumentAsync({
          multiple: false,
        })

        if (props.onDocumentSelect && !docRes.canceled) {
          props.onDocumentSelect(docRes.assets)
        }
      }}
      variant="staggerChild"
    />
  )
}
