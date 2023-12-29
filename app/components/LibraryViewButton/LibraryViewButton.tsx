import React from "react"
import { StaggerButton } from "../StaggerButton/StaggerButton"

export type LibraryViewButtonProps = {
  onPress: () => void
  mode: "viewList" | "gridView"
}

export function LibraryViewButton(props: LibraryViewButtonProps) {
  return (
    <StaggerButton
      mb="4"
      bg="coolGray.700"
      name={props.mode === "viewList" ? "view-list" : "view-grid"}
      _dark={{
        color: "black",
      }}
      color="white"
      onPress={props.onPress}
    />
  )
}
