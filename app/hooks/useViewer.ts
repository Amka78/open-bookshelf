import useOrientation from "@/hooks/useOrientation"
import { useStores } from "@/models"
import { ClientSetting, ClientSettingModel } from "@/models/calibre"
import { LibraryMap } from "@/models/CalibreRootStore"
import { AppStackParamList } from "@/navigators"
import { BookReadingStyleType } from "@/type/types"
import { RouteProp, useRoute } from "@react-navigation/native"
import * as ScreenOrientation from "expo-screen-orientation"
import { useBreakpointValue } from "@gluestack-ui/themed"
import { useState } from "react"
import { useConvergence } from "./useConvergence"

type OrientationType = "vertical" | "horizontal"
type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">
export function useViewer() {
  const { calibreRootStore } = useStores()

  const [showMenu, setShowMenu] = useState(false)
  const route = useRoute<ViewerScreenRouteProp>()
  const convergenceHook = useConvergence()

  const orientation = convergenceHook.orientation
  const selectedLibrary = calibreRootStore.getSelectedLibrary()

  let tempClientSetting = selectedLibrary.clientSetting?.find((value) => {
    return value.id === route.params.library.id
  })

  if (!tempClientSetting) {
    tempClientSetting = ClientSettingModel.create({
      id: route.params.library.id,
      verticalReadingStyle: "singlePage",
      verticalPageDirection: "left",
      horizontalReadingStyle: "facingPageWithTitle",
      horizontalPageDirection: "left",
    })
  }

  const pageDirection =
    orientation === "horizontal"
      ? tempClientSetting.horizontalPageDirection
      : tempClientSetting.verticalPageDirection

  const readingStyle =
    orientation === "horizontal"
      ? tempClientSetting.horizontalReadingStyle
      : tempClientSetting.verticalReadingStyle

  const onSetBookReadingStyle = (style: BookReadingStyleType) => {
    tempClientSetting.setProp(`${orientation}ReadingStyle`, style)
    updateClientSetting(selectedLibrary, route.params.library.id, tempClientSetting)
  }

  const onSetPageDirection = (pageDirection) => {
    tempClientSetting.setProp(`${orientation}PageDirection`, pageDirection)
    updateClientSetting(selectedLibrary, route.params.library.id, tempClientSetting)
  }

  const onOpenMenu = () => {
    setShowMenu(true)
  }
  const onCloseMenu = () => {
    setShowMenu(false)
  }

  return {
    orientation,
    onSetBookReadingStyle,
    onSetPageDirection,
    onOpenMenu,
    onCloseMenu,
    readingStyle,
    pageDirection,
    showMenu,
  }
}

function updateClientSetting(
  selectedLibrary: LibraryMap,
  libraryId: number,
  clientSetting: ClientSetting,
) {
  const storedClientSetting = selectedLibrary.clientSetting.find((value) => {
    return value.id === libraryId
  })

  if (!storedClientSetting) {
    const array = selectedLibrary.clientSetting.slice()

    array.push(clientSetting)
    selectedLibrary.setProp("clientSetting", array)
  }
}
