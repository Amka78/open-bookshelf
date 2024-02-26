import { ComponentProps } from "react"
import { ModalCloseButton, } from "@gluestack-ui/themed"
import { MaterialCommunityIcon } from "../MaterialCommunityIcon/MaterialCommunityIcon"}

export type CloseButtonProps = ComponentProps<typeof ModalCloseButton>

export function CloseButton(props: CloseButtonProps) {
  return (
    <ModalCloseButton {...props}>
      <MaterialCommunityIcon name={"close"} />
    </ModalCloseButton>
  )
}
