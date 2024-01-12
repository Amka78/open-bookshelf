import React from "react"
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
        const docRes = await DocumentPicker.getDocumentAsync({})

        props.onDocumentSelect(docRes.assets)
      }}
      variant="staggerChild"
    />
  )
}
