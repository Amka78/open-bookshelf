import {
  AddFileButton,
  BookDescriptionItem,
  BookImageItem,
  FlatList,
  LeftSideMenu,
  LibraryViewButton,
  SortMenu,
  StaggerContainer,
  IconButton,
} from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { Book } from "@/models/CalibreRootStore"
import { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { HStack } from "@gluestack-ui/themed"
import React, { FC, useLayoutEffect, useRef } from "react"
import { useWindowDimensions } from "react-native"
import { useModal } from "react-native-modalfy"
import { useLibrary } from "./hook/useLibrary"
import { useConvergence } from "@/hooks/useConvergence"
import { AuthButton } from "@/components/AuthButton/AuthButton"
import { api } from "@/services/api"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { SearchBarCommands } from "react-native-screens"
import { values } from "mobx"

export const LibraryScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const navigation = useNavigation<ApppNavigationProp>()
  const modal = useModal<ModalStackParams>()

  const convergenceHook = useConvergence()
  const window = useWindowDimensions()

  const openViewerHook = useOpenViewer()
  const libraryHook = useLibrary()

  const searchBar = useRef<SearchBarCommands>()

  const search = async () => {
    await calibreRootStore.searchLibrary()
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (props) => {
        return (
          <IconButton
            name="arrow-left"
            onPress={() => {
              if (selectedLibrary?.searchSetting?.query !== "") {
                libraryHook.onSearch("")
              } else {
                navigation.goBack()
              }
            }}
            iconSize="md-"
          />
        )
      },
      headerTitle: selectedLibrary?.searchSetting?.query
        ? selectedLibrary?.searchSetting?.query
        : calibreRootStore.selectedLibrary?.id,
      headerSearchBarOptions: {
        hideWhenScrolling: false,

        ref: searchBar,
        onSearchButtonPress: (e) => {
          libraryHook.onSearch(e.nativeEvent.text)
          searchBar.current.blur()
        },
        onOpen: () => {
          if (selectedLibrary.searchSetting?.query) {
            searchBar.current.setText(selectedLibrary.searchSetting.query)
          }
        },
        onCancelButtonPress: () => {
          searchBar.current.toggleCancelButton(false)
        },
      },
    })
  }, [navigation, selectedLibrary?.searchSetting])

  const renderItem = ({ item }: { item: Book }) => {
    const onPress = async () => {
      await openViewerHook.execute(item, selectedLibrary.id, modal)
    }

    let listItem

    const imageUrl = encodeURI(
      `${settingStore.api.baseUrl}/get/thumb/${item.id}/${selectedLibrary.id}?sz=300x400`,
    )

    const onLongPress = () => {
      if (convergenceHook.isLarge) {
        modal.openModal("BookDetailModal", {
          imageUrl: imageUrl,
          book: item,
          fields: selectedLibrary.bookDisplayFields,
          fieldMetadatas: selectedLibrary.fieldMetadata,
          onDeleteConfirmOKPress: () => {
            selectedLibrary.deleteBook(item.id)
          },
          onLinkPress: (query) => {
            libraryHook.onSearch(query)
          },
        })
      } else {
        navigation.navigate("BookDetail", {
          imageUrl: imageUrl,
          book: item,
          fieldNameList: selectedLibrary.bookDisplayFields,
          fieldMetadataList: selectedLibrary.fieldMetadata,
          onLinkPress: (query) => {
            libraryHook.onSearch(query)
          },
        })
      }
    }

    if (libraryHook.currentListStyle === "gridView") {
      listItem = (
        <BookImageItem
          source={{ uri: imageUrl, headers: authenticationStore.getHeader() }}
          onPress={onPress}
          onLongPress={onLongPress}
        />
      )
    } else {
      listItem = (
        <BookDescriptionItem
          source={{ uri: imageUrl, headers: authenticationStore.getHeader() }}
          onPress={onPress}
          onLongPress={onLongPress}
          authors={item.metaData.authors}
          title={item.metaData.title}
        />
      )
    }

    return listItem
  }

  const LibraryCore = (
    <>
      {selectedLibrary ? (
        <FlatList<Book>
          data={selectedLibrary.books ? values(selectedLibrary.books).slice() : undefined}
          renderItem={renderItem}
          estimatedItemSize={214}
          numColumns={Math.floor(window.width / 242)}
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
          preparing={libraryHook.searching}
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
              mode={libraryHook.currentListStyle}
              onPress={libraryHook.onChangeListStyle}
            />
            <SortMenu
              selectedSort={selectedLibrary?.searchSetting?.sort}
              selectedSortOrder={selectedLibrary?.searchSetting?.sortOrder}
              field={selectedLibrary?.sortField}
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
        tagBrowser={selectedLibrary?.tagBrowser}
        selectedName={selectedLibrary?.searchSetting?.query}
      />
      {LibraryCore}
    </HStack>
  ) : (
    LibraryCore
  )
})
