import React from "react"
import { StaggerButton } from "../StaggerButton/StaggerButton"

export type AuthButtonProp = {
  mode: "login" | "logout"
  onLoginPress: () => void
  onLogoutPress: () => void
}

export function AuthButton(props: AuthButtonProp) {
  return (
    <StaggerButton
      mb="4"
      bg="coolGray.700"
      name={props.mode}
      _dark={{
        color: "black",
      }}
      color="white"
      onPress={() => {
        if (props.mode == "login") {
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
