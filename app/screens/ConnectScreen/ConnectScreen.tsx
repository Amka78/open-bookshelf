import { observer } from "mobx-react-lite"
import React, { type FC } from "react"

import { useConnect } from "./hook/useConnect"
import { ConnectScreen as Template } from "./template/ConnectScreen"

export const ConnectScreen: FC = observer(() => {
  const connectHook = useConnect()
  return (
    <Template
      baseUrl={connectHook.baseUrl}
      onConnectPress={connectHook.onConnectPress}
      onLoginPress={connectHook.onLoginPress}
    />
  )
})
