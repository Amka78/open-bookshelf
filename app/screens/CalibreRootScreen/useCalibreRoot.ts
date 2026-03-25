import { useStores } from "@/models"
import type { LibraryMap } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"

export function useCalibreRoot() {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()

  const onLibraryPress = (id: string) => {
    calibreRootStore.setLibrary(id)
    navigation.navigate("Library")
  }

  const library: LibraryMap[] = Array.from(calibreRootStore.libraryMap.values())

  return {
    library,
    onLibraryPress: onLibraryPress,
  }
}
