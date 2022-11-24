import { observer } from "mobx-react-lite"
import React, { FC } from "react"

import { useStores } from "../../models"
import { ConnectScreen as Template } from "./templates/ConnectScreen"

export const ConnectScreen: FC = observer(() => {
  const { settingStore } = useStores()

  return (
    <Template
      baseUrl={settingStore.baseUrl}
      onConnectPress={(data) => settingStore.setUrl(data.url)}
    />
  )
})
