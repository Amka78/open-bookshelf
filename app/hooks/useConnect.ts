import type { LoginType } from "@/components/Modals/LoginModal"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import type { ConnectType } from "@/type/types"
import { useNavigation } from "@react-navigation/native"
import { useForm } from "react-hook-form"

export type UseConnectOptions = {
  /** Called after a successful Calibre connection. Defaults to navigating to CalibreRoot. */
  onConnected?: () => void
  /** Called when the connection attempt fails. Use it to dismiss the connect UI. */
  onConnectFailed?: () => void
}

export function useConnect(options: UseConnectOptions = {}) {
  const { settingStore, calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const baseUrl = settingStore.api.baseUrl ? `${settingStore.api.baseUrl}` : ""

  const form = useForm<ConnectType, unknown, ConnectType>()

  const onConnectPress = async (data: ConnectType) => {
    settingStore.setConnectionSetting(data.url, data.isOPDS)

    if (data.isOPDS) {
      navigation.navigate("OPDSRoot")
      return
    }

    if (await calibreRootStore.initialize()) {
      if (options.onConnected) {
        options.onConnected()
      } else {
        navigation.navigate("CalibreRoot")
      }
      return
    }

    options.onConnectFailed?.()
  }

  const onLoginPress = async (data: LoginType) => {
    await calibreRootStore.initialize()
    navigation.navigate("CalibreRoot")
  }

  return {
    form,
    baseUrl,
    onConnectPress,
    onLoginPress,
  }
}
