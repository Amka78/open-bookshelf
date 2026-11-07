import { Box, Image, Text } from "@/components"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import { usePalette } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { useEffect } from "react"
import React from "react"

export function useODSRoot() {
  const { opdsRootStore, settingStore } = useStores()
  const palette = usePalette()
  const navigation = useNavigation<ApppNavigationProp>()

  useEffect(() => {
    const initialize = async () => {
      await opdsRootStore.root.load(settingStore.api.initialPath ?? undefined)
      navigation.setOptions({
        headerTitle() {
          return React.createElement(
            Box,
            { flexDirection: "row", alignItems: "center" },
            React.createElement(Image, {
              source: opdsRootStore.root.icon ? api.toRequestUrl(opdsRootStore.root.icon) : "",
              style: { height: 30, width: 30 },
              resizeMode: "cover",
            }),
            React.createElement(
              Text,
              { color: palette.textPrimary, paddingLeft: "$2.5", fontSize: "$2xl" },
              opdsRootStore.root.title ?? "",
            ),
          )
        },
      })
    }

    void initialize()
  }, [navigation, opdsRootStore.root, palette.textPrimary, settingStore.api.initialPath])

  const entries = opdsRootStore.root?.entry.slice() ?? []

  return {
    entries,
    opdsRootStore,
    navigation,
  }
}
