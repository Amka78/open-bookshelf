import { observer } from "mobx-react-lite"
import React, { FC } from "react"

import { ConnectScreen as Template } from "./template/ConnectScreen"
import { useConnect } from "./hook/useConnect"

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
