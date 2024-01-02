import React from "react"
import { StaggerButton } from "@/components"
import * as DocumentPicker from "expo-document-picker"

export type AddFileButtonProps = {
  onDocumentSelect: (document: DocumentPicker.DocumentPickerAsset[]) => Promise<void>
}

export function AddFileButton(props: AddFileButtonProps) {
  return (
    <StaggerButton
      mb="4"
      bg="coolGray.700"
      name={"file"}
      _dark={{
        color: "black",
      }}
      color="white"
      onPress={async () => {
        const docRes = await DocumentPicker.getDocumentAsync({})

        props.onDocumentSelect(docRes.assets)
      }}
    />
  )
}
