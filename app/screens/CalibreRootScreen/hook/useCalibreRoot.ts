import { useStores } from "@/models"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { values } from "mobx"

export function useCalibreRoot() {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()

  const onLibraryPress = (id: string) => {
    calibreRootStore.setLibrary(id)
    navigation.navigate("Library")
  }

  return {
    library: values(calibreRootStore.libraryMap),
    onLibraryPress: onLibraryPress,
  }
}
