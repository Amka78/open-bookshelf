import {
  BookDescriptionItem,
  BookImageItem,
  FlatList,
  LeftSideMenu,
  LibraryViewIcon,
  SortMenu,
  StaggerContainer,
} from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { Library } from "@/models/CalibreRootStore"
import { ApppNavigationProp } from "@/navigators"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import {
  HStack,
  Icon,
  IconButton,
  ScrollView,
  Stagger,
  useBreakpointValue,
  useDisclose,
  VStack,
} from "native-base"
import React, { FC, useEffect, useState } from "react"
import { useWindowDimensions } from "react-native"
import { useModal } from "react-native-modalfy"

export type LibraryViewStyle = "gridView" | "viewList"
export const LibraryScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()
  const { isOpen, onToggle } = useDisclose()

  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")
  const navigation = useNavigation<ApppNavigationProp>()

  const modal = useModal<ModalStackParams>()

  const isWideScreen = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const search = async () => {
    await calibreRootStore.searchLibrary()
  }

  useEffect(() => {
    if (!calibreRootStore.selectedLibraryId) {
      navigation.navigate("Connect")
    }
    search()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: calibreRootStore.selectedLibraryId,
      headerSearchBarOptions: {
        hideWhenScrolling: true,
        onSearchButtonPress: (e) => {
          selectedLibrary.searchSetting.setProp("query", e.nativeEvent.text)
          search()
        },
        onClose: () => {
          selectedLibrary.searchSetting.setProp("query", "")
          search()
        },
      },
    })
  }, [])

  const window = useWindowDimensions()

  let header

  if (authenticationStore.isAuthenticated) {
    header = { Authorization: `Basic ${authenticationStore.token}` }
  }

  const renderItem = ({ item }: { item: Library }) => {
    const onItemPress = async (format: string) => {
      item.metaData.setProp("selectedFormat", format)
      if (format === "PDF") {
        navigation.navigate("PDFViewer", { library: item })
      } else {
        try {
          await item.convertBook(format, () => {
            navigation.navigate("Viewer", { library: item })
          })
        } catch (e) {
          modal.openModal("ErrorModal", { message: e.message, titleTx: "errors.failedConvert" })
        }
      }
    }
    const onPress = async () => {
      if (item.metaData.formats.length > 1) {
        modal.openModal("FormatSelectModal", {
          formats: item.metaData.formats,
          onSelectFormat: async (format) => {
            await onItemPress(format)
          },
        })
      } else {
        await onItemPress(item.metaData.formats[0])
      }
    }

    let listItem

    const imageUrl = `${settingStore.api.baseUrl}/get/thumb/${item.id}/${selectedLibrary.id}?sz=300x400`

    const itemStyle = isWideScreen ? desktopViewStyle : mobileViewStyle

    if (itemStyle === "gridView") {
      listItem = <BookImageItem source={{ uri: imageUrl, headers: header }} onPress={onPress} />
    } else {
      listItem = (
        <BookDescriptionItem
          source={{ uri: imageUrl, headers: header }}
          onPress={onPress}
          authors={item.metaData.authors}
          title={item.metaData.title}
        />
      )
    }

    return listItem
  }

  const selectedLibrary = calibreRootStore.getSelectedLibrary()

  const LibraryCore = (
    <>
      {selectedLibrary ? (
        <FlatList<Library>
          data={selectedLibrary?.value.slice()}
          renderItem={renderItem}
          estimatedItemSize={214}
          numColumns={isWideScreen ? Math.floor(window.width / 242) : 1}
          onRefresh={
            isWideScreen
              ? undefined
              : async () => {
                  await search()
                }
          }
          onEndReached={async () => {
            await calibreRootStore.searchMoreLibrary()
          }}
        />
      ) : null}
      <StaggerContainer
        menusHeight={230}
        menus={
          <>
            <LibraryViewIcon
              mode={isWideScreen ? desktopViewStyle : mobileViewStyle}
              onPress={() => {
                if (isWideScreen) {
                  setDesktopViewStyle(desktopViewStyle === "gridView" ? "viewList" : "gridView")
                } else {
                  setMovileViewStyle(mobileViewStyle === "gridView" ? "viewList" : "gridView")
                }
              }}
            />
            <SortMenu
              selectedSort={selectedLibrary.searchSetting?.sort}
              selectedSortOrder={selectedLibrary.searchSetting?.sortOrder}
              field={selectedLibrary.sortField}
              onSortChange={(val) => {
                if (val === selectedLibrary.searchSetting?.sort) {
                  selectedLibrary.searchSetting.setProp(
                    "sortOrder",
                    selectedLibrary.searchSetting.sortOrder === "desc" ? "asc" : "desc",
                  )
                } else {
                  selectedLibrary.searchSetting.setProp("sort", val)
                  selectedLibrary.searchSetting.setProp("sortOrder", "desc")
                }
                search()
              }}
            />
          </>
        }
      />
    </>
  )

  return isWideScreen ? (
    <HStack flex="1">
      <ScrollView backgroundColor={"white"} maxWidth={"32"}>
        <LeftSideMenu
          onNodePress={async (name) => {
            selectedLibrary.searchSetting.setProp("query", name)
            await search()
          }}
          tagBrowser={selectedLibrary.tagBrowser}
          selectedName={selectedLibrary.searchSetting?.query}
        />
      </ScrollView>
      {LibraryCore}
    </HStack>
  ) : (
    LibraryCore
  )
})
