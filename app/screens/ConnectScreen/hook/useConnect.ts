import { useStores } from "@/models"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { ConnectType } from "../type/ConnectType"
import { LoginType } from "@/components/Modals/LoginModal"
export function useConnect() {
  const { settingStore, calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()

  const baseUrl = settingStore.api.baseUrl ? `${settingStore.api.baseUrl}` : ""

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
    baseUrl,
    onConnectPress,
    onLoginPress,
  }
}
