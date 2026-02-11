import { useConvergence } from "@/hooks/useConvergence"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators"
import { api } from "@/services/api"
import { useNavigation } from "@react-navigation/native"
import type { DocumentPickerAsset } from "expo-document-picker"
import { useEffect, useState } from "react"
export type LibraryViewStyle = "gridView" | "viewList"
export function useLibrary() {
  const { calibreRootStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const selectedLibrary = calibreRootStore.selectedLibrary

  const [searching, setSearching] = useState(false)
  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")

  const convergenceHook = useConvergence()

  const books = undefined
  const search = async () => {
    setSearching(true)
    try {
      await calibreRootStore.searchLibrary()
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    search()

    calibreRootStore.getTagBrowser()
  }, [])

  const onSearch = async (searchCondition?: string) => {
    selectedLibrary.searchSetting.setProp("query", searchCondition ?? "")
    await search()
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

    console.log("onUploadFile", assets);

    try {
      await api.uploadFile(
        assets[0].name,
        selectedLibrary.id,
        assets[0].file ?? assets[0].uri,
      )
      await onSearch()
    } finally {
      setSearching(false)
    }
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
