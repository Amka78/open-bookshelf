import { useStores } from "@/models"
import type { LibraryMap } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"

export function useCalibreRoot() {
  const { calibreRootStore } = useStores()

  const navigation = useNavigation<ApppNavigationProp>()

  const onLibraryPress = (id: string) => {
    calibreRootStore.setLibrary(id)

    // デスクトップでは Library が土台に残っているため、navigate で積み増さず popTo で戻る。
    const hasLibraryRoute = navigation.getState().routes.some((route) => route.name === "Library")
    if (hasLibraryRoute) {
      navigation.popTo("Library")
      return
    }

    navigation.navigate("Library")
  }

  const library: LibraryMap[] = Array.from(calibreRootStore.libraryMap.values())

  return {
    library,
    onLibraryPress: onLibraryPress,
  }
}
