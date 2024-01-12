import React from "react"
import { IconButton } from "@/components"
import { LoaderIcon } from "@gluestack-ui/themed"

export type AuthButtonProp = {
  mode: "login" | "logout"
  onLoginPress: () => void
  onLogoutPress: () => void
}

export function AuthButton(props: AuthButtonProp) {
  return (
    <IconButton
      variant="staggerChild"
      iconSize="md-"
      name={props.mode === "login" ? "logout" : "login"}
      onPress={() => {
        if (props.mode === "login") {
          if (props.onLoginPress) {
            props.onLoginPress()
          }
        } else {
          if (props.onLogoutPress) {
            props.onLogoutPress()
          }
        }
      }}
    />
  )
}
