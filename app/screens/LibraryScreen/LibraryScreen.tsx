import {
  AddFileButton,
  BookDescriptionItem,
  BookImageItem,
  FlatList,
  IconButton,
  LeftSideMenu,
  LibraryViewButton,
  SortMenu,
  StaggerContainer,
} from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { Library } from "@/models/CalibreRootStore"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { HStack } from "@gluestack-ui/themed"
import React, { FC, useEffect, useState, useLayoutEffect, useRef } from "react"
import { useWindowDimensions } from "react-native"
import { useModal } from "react-native-modalfy"
import { useLibrary } from "./hook/useLibrary"
import { useConvergence } from "@/hooks/useConvergence"
import { AuthButton } from "@/components/AuthButton/AuthButton"
import { api } from "@/services/api"

export type LibraryViewStyle = "gridView" | "viewList"
export const LibraryScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")
  const navigation = useNavigation<ApppNavigationProp>()

  const first = useRef()
  const modal = useModal<ModalStackParams>()

  const libraryHook = useLibrary()
  const convergenceHook = useConvergence()

  const search = async () => {
    await calibreRootStore.searchLibrary()
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: calibreRootStore.selectedLibraryId,
      headerSearchBarOptions: {
        hideWhenScrolling: false,
        onSearchButtonPress: (e) => {
          libraryHook.onSearch(e.nativeEvent.text)
        },
        onClose: () => {
          libraryHook.onSearch()
        },
      },
    })
  }, [navigation])

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

    const itemStyle = convergenceHook.isLarge ? desktopViewStyle : mobileViewStyle

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
          numColumns={convergenceHook.isLarge ? Math.floor(window.width / 242) : 1}
          onRefresh={
            convergenceHook.isLarge
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
            <AuthButton
              mode={authenticationStore.isAuthenticated ? "logout" : "login"}
              onLoginPress={() => {
                modal.openModal("LoginModal", {
                  onLoginPress: () => {
                    navigation.navigate("Connect")
                  },
                })
              }}
              onLogoutPress={() => {
                authenticationStore.logout()
                navigation.navigate("Connect")
              }}
            />
            <AddFileButton
              onDocumentSelect={async (assets) => {
                await api.uploadFile(assets[0].name, selectedLibrary.id, assets[0].uri)
                libraryHook.onSearch()
              }}
            />
            <LibraryViewButton
              mode={convergenceHook.isLarge ? desktopViewStyle : mobileViewStyle}
              onPress={() => {
                if (convergenceHook.isLarge) {
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
                libraryHook.onSort(val)
              }}
            />
          </>
        }
      />
    </>
  )

  return convergenceHook.isLarge ? (
    <HStack flex={1}>
      <LeftSideMenu
        onNodePress={async (name) => {
          libraryHook.onSearch(name)
        }}
        tagBrowser={selectedLibrary.tagBrowser}
        selectedName={selectedLibrary.searchSetting?.query}
      />
      {LibraryCore}
    </HStack>
  ) : (
    LibraryCore
  )
})
