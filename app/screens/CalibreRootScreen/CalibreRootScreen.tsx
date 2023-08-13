import { useStores } from "@/models"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect } from "react"

import { CalibreRootScreen as Template } from "./templates/CalibreRootScreen"

export const CalibreRootScreen: FC = observer(() => {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()
  const initialize = async () => {
    await calibreRootStore.getTagBrowser()
  }

  useEffect(() => {
    initialize()
  }, [])

  return (
    <Template
      libraries={calibreRootStore.libraryMap}
      onLibraryPress={(id: string) => {
        calibreRootStore.setSelectedLibraryId(id)
        navigation.navigate("Library")
      }}
    />
  )
})
