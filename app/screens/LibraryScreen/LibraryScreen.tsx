import {
  AddFileButton,
  AuthButton,
  BookDescriptionItem,
  BookImageItem,
  Box,
  FlatList,
  HStack,
  IconButton,
  LeftSideMenu,
  LibraryViewButton,
  SortMenu,
  StaggerContainer,
} from "@/components"
import type { ModalStackParams } from "@/components/Modals/Types"
import { useConvergence } from "@/hooks/useConvergence"
import { useDeleteBook } from "@/hooks/useDeleteBook"
import { useDownloadBook } from "@/hooks/useDownloadBook"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { useStores } from "@/models"
import type { Book } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators"
import { useNavigation } from "@react-navigation/native"
import { values } from "mobx"
import { observer } from "mobx-react-lite"
import type React from "react"
import { type FC, useLayoutEffect, useRef } from "react"
import { Platform, useWindowDimensions } from "react-native"
import { useModal } from "react-native-modalfy"
import type { SearchBarCommands } from "react-native-screens"
import { useLibrary } from "./hook/useLibrary"

export const LibraryScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const navigation = useNavigation<ApppNavigationProp>()
  const modal = useModal<ModalStackParams>()

  const convergenceHook = useConvergence()
  const window = useWindowDimensions()

  const openViewerHook = useOpenViewer()
  const deleteBookHook = useDeleteBook()
  const downloadBookHook = useDownloadBook()
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
      selectedLibrary.setBook(item.id)
      await openViewerHook.execute(modal)
    }

    let listItem: React.JSX.Element

    const imageUrl = encodeURI(
      `${settingStore.api.baseUrl}/get/thumb/${item.id}/${selectedLibrary.id}?sz=300x400`,
    )

    const openViewerInNewTab = (info: {
      route: "Viewer" | "PDFViewer"
      format: string
      bookId: number
      libraryId: string
    }) => {
      if (Platform.OS !== "web" || typeof globalThis === "undefined") {
        return
      }

      const location = (globalThis as { location?: Location }).location
      if (!location?.href) {
        return
      }

      const url = new URL(location.href)
      url.searchParams.set("viewerTab", info.route)
      url.searchParams.set("viewerBookId", String(info.bookId))
      url.searchParams.set("viewerLibraryId", info.libraryId)
      url.searchParams.set("viewerFormat", info.format)
      globalThis.open?.(url.toString(), "_blank", "noopener,noreferrer")
    }

    const onLongPress = async () => {
      selectedLibrary.setBook(item.id)
      if (Platform.OS === "web") {
        await openViewerHook.execute(modal, {
          navigate: false,
          onComplete: (info) => {
            openViewerInNewTab(info)
          },
        })
        return
      }

      if (convergenceHook.isLarge) {
        modal.openModal("BookDetailModal", {
          imageUrl: imageUrl,
          onLinkPress: (query) => {
            libraryHook.onSearch(query)
          },
        })
      } else {
        navigation.navigate("BookDetail", {
          imageUrl: imageUrl,
          onLinkPress: (query) => {
            libraryHook.onSearch(query)
          },
        })
      }
    }

    const onOpenBook = async () => {
      selectedLibrary.setBook(item.id)
      await openViewerHook.execute(modal)
    }

    const onDownloadBook = async () => {
      selectedLibrary.setBook(item.id)
      await downloadBookHook.execute(modal)
    }

    const onConvertBook = async () => {
      selectedLibrary.setBook(item.id)
      const book = selectedLibrary.selectedBook
      if (!book?.metaData?.formats?.length) {
        return
      }

      const runConvert = async (format: string) => {
        try {
          await book.convert(format, selectedLibrary.id, () => {})
        } catch (e) {
          modal.openModal("ErrorModal", {
            message: e instanceof Error ? e.message : String(e),
            titleTx: "errors.failedConvert",
          })
        }
      }

      if (book.metaData.formats.length > 1) {
        modal.openModal("FormatSelectModal", {
          formats: book.metaData.formats,
          onSelectFormat: async (format) => {
            await runConvert(format)
          },
        })
      } else {
        await runConvert(book.metaData.formats[0])
      }
    }

    const onEditBook = () => {
      selectedLibrary.setBook(item.id)
      if (convergenceHook.isLarge) {
        modal.openModal("BookEditModal", {
          imageUrl: imageUrl,
        })
      } else {
        navigation.navigate("BookEdit", {
          imageUrl: imageUrl,
        })
      }
    }

    const onDeleteBook = async () => {
      selectedLibrary.setBook(item.id)
      await deleteBookHook.execute(modal)
    }

    if (libraryHook.currentListStyle === "gridView") {
      listItem = (
        <BookImageItem
          source={{ uri: imageUrl, headers: authenticationStore.getHeader() }}
          onPress={onPress}
          onLongPress={onLongPress}
          detailMenuProps={{
            onOpenBook: onOpenBook,
            onDownloadBook: onDownloadBook,
            onConvertBook: onConvertBook,
            onEditBook: onEditBook,
            onDeleteBook: onDeleteBook,
          }}
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
          onLinkPress={(link) => {
            libraryHook.onSearch(`authors:=${link}`)
          }}
        />
      )
    }

    return listItem
  }

  const LibraryCore = (
    <>
      {selectedLibrary ? (
        <FlatList<Book>
          key={libraryHook.currentListStyle} // to force re-render when list style change
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
              onDocumentSelect={async (documents) => {
                await libraryHook.onUploadFile(documents)
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
    <Box flex={1} flexDirection="row">
      <Box flex={0.1}>
        <LeftSideMenu
          onNodePress={async (name) => {
            libraryHook.onSearch(name)
          }}
          tagBrowser={selectedLibrary?.tagBrowser}
          selectedName={selectedLibrary?.searchSetting?.query}
        />
      </Box>
      <Box flex={1}>{LibraryCore}</Box>
    </Box>
  ) : (
    LibraryCore
  )
})
