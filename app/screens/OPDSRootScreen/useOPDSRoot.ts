import { Box, Image, Text } from "@/components"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { usePalette } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { useCallback, useEffect } from "react"
import React from "react"

export function useODSRoot() {
  const { opdsRootStore, settingStore } = useStores()
  const palette = usePalette()
  const navigation = useNavigation<ApppNavigationProp>()

  const setupHeaderTitle = useCallback(() => {
    return React.createElement(
      Box,
      { flexDirection: "row", alignItems: "center" },
      React.createElement(Image, {
        source: `${settingStore.api.baseUrl}${opdsRootStore.root.icon}`,
        style: { height: 30, width: 30 },
        resizeMode: "cover",
      }),
      React.createElement(
        Text,
        { color: palette.textPrimary, paddingLeft: "$2.5", fontSize: "$2xl" },
        opdsRootStore.root.title,
      ),
    )
  }, [
    opdsRootStore.root.icon,
    opdsRootStore.root.title,
    palette.textPrimary,
    settingStore.api.baseUrl,
  ])

  const initialize = useCallback(async () => {
    await opdsRootStore.root.load(settingStore.api.initialPath)
    navigation.setOptions({
      headerTitle() {
        return setupHeaderTitle()
      },
    })
  }, [navigation, opdsRootStore.root, settingStore.api.initialPath, setupHeaderTitle])

  useEffect(() => {
    void initialize()
  }, [initialize])

  const entries = opdsRootStore.root?.entry.slice() ?? []

  return {
    entries,
    opdsRootStore,
    navigation,
  }
}
