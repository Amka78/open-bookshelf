import { useStores } from "@/models"
import type { LibraryMap } from "@/models/CalibreRootStore"
import { type ClientSetting, ClientSettingModel } from "@/models/calibre"
import type { AppStackParamList } from "@/navigators"
import type { BookReadingStyleType } from "@/type/types"
import { type RouteProp, useRoute } from "@react-navigation/native"
import { useState } from "react"
import { useConvergence } from "./useConvergence"

type OrientationType = "vertical" | "horizontal"
type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">
export function useViewer() {
  const { calibreRootStore } = useStores()

  const [showMenu, setShowMenu] = useState(false)
  const convergenceHook = useConvergence()

  const orientation = convergenceHook.orientation
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  let tempClientSetting = selectedLibrary.clientSetting?.find((value) => {
    return value.id === selectedBook.id
  })

  if (!tempClientSetting) {
    tempClientSetting = ClientSettingModel.create({
      id: selectedBook.id,
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
    updateClientSetting(selectedLibrary, selectedBook.id, tempClientSetting)
  }

  const onSetPageDirection = (pageDirection) => {
    tempClientSetting.setProp(`${orientation}PageDirection`, pageDirection)
    updateClientSetting(selectedLibrary, selectedBook.id, tempClientSetting)
  }

  const onManageMenu = () => {
    setShowMenu(!showMenu)
  }

  return {
    orientation,
    onSetBookReadingStyle,
    onSetPageDirection,
    onManageMenu,
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
