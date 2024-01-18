import { useStores } from "@/models"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"

export function useCalibreRoot() {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()
  const initialize = async () => {
    await calibreRootStore.getTagBrowser()
  }

  const onLibraryPass = (id: string) => {
    calibreRootStore.setSelectedLibraryId(id)
    navigation.navigate("Library")
  }

  return {
    library: calibreRootStore.libraryMap,
    onLibraryPress: onLibraryPass,
    initialize
  }
}
