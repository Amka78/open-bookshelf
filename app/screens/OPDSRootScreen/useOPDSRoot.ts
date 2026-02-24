import { useStores } from "@/models"
import { usePalette } from "@/theme"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { useEffect } from "react"
import { Box, Image, Text } from "@/components"
import React from "react"

export function useODSRoot() {
  const { opdsRootStore, settingStore } = useStores()
  const palette = usePalette()
  const navigation = useNavigation<ApppNavigationProp>()

  const initialize = async () => {
    await opdsRootStore.root.load(settingStore.api.initialPath)
    navigation.setOptions({
      headerTitle() {
        return setupHeaderTitle()
      },
    })
  }

  useEffect(() => {
    initialize()
  }, [settingStore.api.initialPath, settingStore.api.baseUrl])

  const entries = opdsRootStore.root?.entry.slice() ?? []

  return {
    entries,
    opdsRootStore,
    navigation,
  }
}
