import {
  BookDescriptionItem,
  BookImageItem,
  FlatList,
  LeftSideMenu,
  SortMenu,
  StaggerContainer,
} from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { Library } from "@/models/CalibreRootStore"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import React, { FC, useEffect, useState } from "react"
import { useWindowDimensions } from "react-native"
export function useLibrary() {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
  const navigation = useNavigation<ApppNavigationProp>()
  const selectedLibrary = calibreRootStore.getSelectedLibrary()

  const search = async () => {
    await calibreRootStore.searchLibrary()
  }

  useEffect(() => {
    if (!calibreRootStore.selectedLibraryId) {
      navigation.navigate("Connect")
    }
    search()
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

  return {
    onSearch,
    onSort,
  }
}
