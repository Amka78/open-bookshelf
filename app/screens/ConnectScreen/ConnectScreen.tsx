import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"

import { useStores } from "@/models"
import { ApppNavigationProp } from "@/navigators"
import { ConnectScreen as Template } from "./templates/ConnectScreen"

export const ConnectScreen: FC = observer(() => {
  const { settingStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  return (
    <Template
      baseUrl={settingStore.api.baseUrl ? `${settingStore.api.baseUrl}` : ""}
      onConnectPress={async (data) => {
        settingStore.setConnectionSetting(data.url, data.isOPDS)
        navigation.navigate(data.isOPDS ? "OPDSRoot" : "CalibreRoot")
      }}
    />
  )
})
