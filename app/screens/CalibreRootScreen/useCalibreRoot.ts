import { useStores } from "@/models"
import type { LibraryMap } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { values } from "mobx"

export function useCalibreRoot() {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()

  const onLibraryPress = (id: string) => {
    calibreRootStore.setLibrary(id)
    navigation.navigate("Library")
  }

  const library: LibraryMap[] = Array.from(values(calibreRootStore.libraryMap))

  return {
    library,
    onLibraryPress: onLibraryPress,
  }
}
