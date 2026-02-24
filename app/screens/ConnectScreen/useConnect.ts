import { useForm } from "react-hook-form"
import type { LoginType } from "@/components/Modals/LoginModal"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import type { ConnectType } from "./ConnectType"

export function useConnect() {
  const { settingStore, calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const baseUrl = settingStore.api.baseUrl ? `${settingStore.api.baseUrl}` : ""

  const form = useForm<ConnectType, unknown, ConnectType>()

  const onConnectPress = async (data: ConnectType) => {
    settingStore.setConnectionSetting(data.url, data.isOPDS)

    if (data.isOPDS) {
      navigation.navigate("OPDSRoot")
    } else if (await calibreRootStore.initialize()) {
      navigation.navigate("CalibreRoot")
    }
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
