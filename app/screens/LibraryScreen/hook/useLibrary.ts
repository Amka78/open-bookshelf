import { useConvergence } from "@/hooks/useConvergence"
import { useStores } from "@/models"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { DocumentPickerAsset } from "expo-document-picker"
import { useEffect, useState } from "react"
import { api } from "@/services/api"
export type LibraryViewStyle = "gridView" | "viewList"
export function useLibrary() {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const selectedLibrary = calibreRootStore.selectedLibrary

  const [searching, setSearching] = useState(false)
  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")

  const convergenceHook = useConvergence()

  let books = undefined
  const search = async () => {
    setSearching(true)
    await calibreRootStore.searchLibrary()
    setSearching(false)
  }

  useEffect(() => {
    search()

    calibreRootStore.getTagBrowser()
  }, [])

  const onSearch = (searchCondition?: string) => {
    selectedLibrary.searchSetting.setProp("query", searchCondition ?? "")
    search()
  }

  const onSort = (sortKey: string) => {
    if (sortKey === selectedLibrary.searchSetting?.sort) {
      selectedLibrary.searchSetting.setProp(
        "sortOrder",
        selectedLibrary.searchSetting.sortOrder === "desc" ? "asc" : "desc",
      )
    } else {
      selectedLibrary.searchSetting.setProp("sort", sortKey)
      selectedLibrary.searchSetting.setProp("sortOrder", "desc")
    }
    search()
  }

  const onChangeListStyle = () => {
    setSearching(true)
    if (convergenceHook.isLarge) {
      setDesktopViewStyle(desktopViewStyle === "gridView" ? "viewList" : "gridView")
    } else {
      setMovileViewStyle(mobileViewStyle === "gridView" ? "viewList" : "gridView")
    }
    setSearching(false)
  }

  const onUploadFile = async (assets: DocumentPickerAsset[]) => {
    setSearching(true)
    await api.uploadFile(assets[0].name, selectedLibrary.id, assets[0].uri)
    onSearch()
  }

  const currentListStyle = convergenceHook.isLarge ? desktopViewStyle : mobileViewStyle

  return {
    currentListStyle,
    onChangeListStyle,
    onUploadFile,
    onSearch,
    onSort,
    searching,
    mobileViewStyle,
    desktopViewStyle,
  }
}
