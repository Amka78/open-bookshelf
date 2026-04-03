import {
  AddFileButton,
  AuthButton,
  BookDescriptionItem,
  BookImageItem,
  Box,
  FlatList,
  HStack,
  IconButton,
  Input,
  LeftSideMenu,
  LibraryViewButton,
  SelectionActionBar,
  SortMenu,
  StaggerContainer,
  Text,
  VirtualLibraryButton,
} from "@/components"
import { InputField } from "@/components/InputField/InputField"
import { useConvergence } from "@/hooks/useConvergence"
import { useDeleteBook } from "@/hooks/useDeleteBook"
import { useDownloadBook } from "@/hooks/useDownloadBook"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { useStores } from "@/models"
import type { Book } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import { deleteCachedBookImages } from "@/utils/bookImageCache"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type React from "react"
import { type FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Platform, useWindowDimensions } from "react-native"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { useBulkDownloadBooks } from "@/hooks/useBulkDownloadBooks"
import type { SearchBarCommands } from "react-native-screens"
import type { CalibreFieldOperator, QueryOperator } from "@/components/LeftSideMenu/LeftSideMenu"
import {
  buildItemKey,
  buildTagQuery,
  normalizeTagQuery,
  parseTagQuery,
} from "@/components/LeftSideMenu/LeftSideMenu"
import { useLibrary } from "./useLibrary"

/** Split a query string by AND or OR, returning individual conditions. */
function parseQueryParts(query: string): string[] {
  if (!query.trim()) return []
  return query
    .split(/ AND | OR /i)
    .map((q) => q.trim())
    .filter(Boolean)
}

export const LibraryScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const navigation = useNavigation<ApppNavigationProp>()
  const modal = useElectrobunModal()
  const isFocused = useIsFocused()
  const [itemOperators, setItemOperators] = useState<Record<string, QueryOperator>>({})
  const [itemCalibreOperators, setItemCalibreOperators] = useState<
    Record<string, CalibreFieldOperator>
  >({})

  const convergenceHook = useConvergence()
  const window = useWindowDimensions()

  const openViewerHook = useOpenViewer()
  const deleteBookHook = useDeleteBook()
  const downloadBookHook = useDownloadBook()
  const bulkDownloadHook = useBulkDownloadBooks()
  const libraryHook = useLibrary()
  const [authStateVersion, setAuthStateVersion] = useState(() => api.getAuthStateVersion())

  useEffect(() => {
    return api.subscribeAuthState((version) => {
      setAuthStateVersion(version)
    })
  }, [])

  const searchBar = useRef<SearchBarCommands | null>(null)
  const thumbnailSourceCacheRef = useRef<
    Map<
      Book["id"],
      {
        authStateVersion: number
        source: { uri: string; headers: Record<string, string> | undefined }
      }
    >
  >(new Map())

  const rawBookList = selectedLibrary?.books ? Array.from(selectedLibrary.books.values()) : []
  const bookList = rawBookList

  const thumbnailSourceById = useMemo(() => {
    const nextCache = new Map<
      Book["id"],
      {
        authStateVersion: number
        source: { uri: string; headers: Record<string, string> | undefined }
      }
    >()

    for (const book of bookList) {
      const uri = encodeURI(api.getBookThumbnailUrl(book.id, selectedLibrary.id))
      const headers = api.getAuthHeaders(uri)
      const cachedSource = thumbnailSourceCacheRef.current.get(book.id)
      const cacheEntry =
        cachedSource &&
        cachedSource.authStateVersion === authStateVersion &&
        cachedSource.source.uri === uri &&
        cachedSource.source.headers === headers
          ? cachedSource
          : { authStateVersion, source: { uri, headers } }

      nextCache.set(book.id, cacheEntry)
    }

    thumbnailSourceCacheRef.current = nextCache
    return nextCache
  }, [authStateVersion, bookList, selectedLibrary.id])

  const libraryActions = useMemo(() => {
    return (
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
        <VirtualLibraryButton
          virtualLibraries={selectedLibrary?.virtualLibraries?.slice() ?? []}
          selectedVl={selectedLibrary?.searchSetting?.vl}
          onSelect={(name) => {
            libraryHook.onSelectVirtualLibrary(name)
          }}
          isLargeScreen={convergenceHook.isLarge}
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
    )
  }, [
    authenticationStore,
    authenticationStore.isAuthenticated,
    libraryHook,
    libraryHook.currentListStyle,
    modal,
    navigation,
    selectedLibrary,
    selectedLibrary?.virtualLibraries,
    selectedLibrary?.searchSetting?.vl,
    selectedLibrary?.searchSetting?.sort,
    selectedLibrary?.searchSetting?.sortOrder,
    selectedLibrary?.sortField,
    convergenceHook.isLarge,
  ])

  useLayoutEffect(() => {
    const headerTitleText = selectedLibrary?.searchSetting?.query
      ? selectedLibrary.searchSetting.query
      : calibreRootStore.selectedLibrary?.id

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
      headerTitle: convergenceHook.isLarge
        ? () => {
            return (
              <HStack alignItems="center">
                <Box w={260} ml={8}>
                  <Input size="sm">
                    <InputField
                      value={libraryHook.headerSearchText}
                      onChangeText={(text) => {
                        libraryHook.setHeaderSearchText(libraryHook.completeSearchParameter(text))
                      }}
                      textAlign="left"
                      onSubmitEditing={() => {
                        libraryHook.onSearch(libraryHook.headerSearchText)
                      }}
                      returnKeyType="search"
                      autoCapitalize="none"
                      autoCorrect={false}
                      clearButtonMode="while-editing"
                    />
                  </Input>
                </Box>
              </HStack>
            )
          }
        : headerTitleText,
      headerRight: convergenceHook.isLarge
        ? () => {
            return <HStack space="sm">{libraryActions}</HStack>
          }
        : undefined,
      headerSearchBarOptions: {
        hideWhenScrolling: false,

        ref: searchBar,
        onSearchButtonPress: (e) => {
          libraryHook.onSearch(e.nativeEvent.text)
          searchBar.current?.blur()
        },
        onChangeText: (e) => {
          const completedText = libraryHook.completeSearchParameter(e.nativeEvent.text)
          if (completedText !== e.nativeEvent.text) {
            searchBar.current?.setText(completedText)
          }
        },
        onOpen: () => {
          if (selectedLibrary.searchSetting?.query) {
            searchBar.current?.setText(selectedLibrary.searchSetting.query)
          }
        },
        onCancelButtonPress: () => {
          searchBar.current?.toggleCancelButton(false)
        },
      },
    })
  }, [
    calibreRootStore.selectedLibrary?.id,
    convergenceHook.isLarge,
    libraryHook,
    libraryActions,
    navigation,
    selectedLibrary,
    selectedLibrary?.searchSetting,
    selectedLibrary?.searchSetting?.query,
  ])

  const renderItem = useCallback(
    ({ item }: { item: Book }) => {
      const onPress = async () => {
        selectedLibrary.setBook(item.id)
        await openViewerHook.execute(modal)
      }

      let listItem: React.JSX.Element
      const hasReadingHistory = calibreRootStore.readingHistories.some((value) => {
        return (
          value.bookId === item.id &&
          value.libraryId === selectedLibrary.id &&
          value.cachedPath.length > 0
        )
      })

      const thumbnailUri = encodeURI(api.getBookThumbnailUrl(item.id, selectedLibrary.id))
      const imageSource = thumbnailSourceById.get(item.id)?.source ?? {
        uri: thumbnailUri,
        headers: api.getAuthHeaders(thumbnailUri),
      }
      const imageUrl = imageSource.uri

      const onLongPress = async () => {
        selectedLibrary.setBook(item.id)
        if (Platform.OS === "web") {
          await openViewerHook.execute(modal)
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
        modal.openModal("BookConvertModal", { imageUrl })
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

      const onClearBookCache = () => {
        modal.openModal("ConfirmModal", {
          titleTx: "modal.cacheClearConfirmModal.title",
          messageTx: "modal.cacheClearConfirmModal.message",
          onOKPress: async () => {
            try {
              const targetReadingHistories = calibreRootStore.readingHistories.filter((history) => {
                return history.libraryId === selectedLibrary.id && history.bookId === item.id
              })

              const cachedPathList = targetReadingHistories.flatMap((history) => history.cachedPath)
              calibreRootStore.removeReadingHistoriesByBook(selectedLibrary.id, item.id)

              await deleteCachedBookImages(cachedPathList)
            } catch (e) {
              modal.closeModal("ConfirmModal")
              modal.openModal("ErrorModal", {
                titleTx: "common.error",
                message: e instanceof Error ? e.message : String(e),
              })
            }
          },
        })
      }

      if (libraryHook.currentListStyle === "gridView") {
        listItem = (
          <BookImageItem
            source={imageSource}
            showCachedIcon={hasReadingHistory}
            onCachedIconPress={onClearBookCache}
            onPress={
              libraryHook.isSelectionMode
                ? async () => libraryHook.toggleBookSelection(item.id)
                : onPress
            }
            onLongPress={onLongPress}
            detailMenuProps={
              libraryHook.isSelectionMode
                ? undefined
                : {
                    onOpenBook: onOpenBook,
                    onDownloadBook: onDownloadBook,
                    onConvertBook: onConvertBook,
                    onEditBook: onEditBook,
                    onDeleteBook: onDeleteBook,
                  }
            }
            selected={libraryHook.isBookSelected(item.id)}
            onSelectToggle={() => libraryHook.toggleBookSelection(item.id)}
          />
        )
      } else {
        listItem = (
          <BookDescriptionItem
            source={imageSource}
            showCachedIcon={hasReadingHistory}
            onCachedIconPress={onClearBookCache}
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
    },
    [
      calibreRootStore,
      convergenceHook.isLarge,
      deleteBookHook,
      downloadBookHook,
      libraryHook,
      modal,
      navigation,
      openViewerHook,
      selectedLibrary,
      thumbnailSourceById,
    ],
  )

  const onBulkEdit = () => {
    if (libraryHook.selectedBooks.length === 0) return
    modal.openModal("BulkEditModal", {
      books: libraryHook.selectedBooks,
      libraryId: selectedLibrary.id,
      onComplete: () => {
        libraryHook.clearSelection()
      },
    })
  }

  const onBulkDownload = async () => {
    if (libraryHook.selectedBooks.length === 0) return
    await bulkDownloadHook.execute(libraryHook.selectedBooks, selectedLibrary.id, modal)
  }

  const LibraryCore = (
    <>
      {libraryHook.isSelectionMode && (
        <SelectionActionBar
          selectedCount={libraryHook.selectedBookIds.size}
          onBulkEdit={onBulkEdit}
          onBulkDownload={onBulkDownload}
          onClearSelection={libraryHook.clearSelection}
        />
      )}
      {selectedLibrary ? (
        <FlatList<Book>
          key={libraryHook.currentListStyle} // to force re-render when list style change
          data={bookList}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          numColumns={Math.floor(window.width / 242)}
          onRefresh={
            convergenceHook.isLarge
              ? undefined
              : async () => {
                  await libraryHook.onSearch()
                }
          }
          onEndReached={async () => {
            if (!isFocused) {
              return
            }
            await calibreRootStore.searchMoreLibrary()
          }}
          preparing={libraryHook.searching}
        />
      ) : null}
      {convergenceHook.isLarge ? null : (
        <StaggerContainer
          menusHeight={270}
          menus={
            <>
              <IconButton
                name="filter-variant"
                variant="staggerChild"
                onPress={() => {
                  navigation.navigate("DetailSearch", {
                    initialQuery: selectedLibrary?.searchSetting?.query ?? "",
                    onSearch: (query) => {
                      libraryHook.onSearch(query)
                    },
                  })
                }}
              />
              {libraryActions}
            </>
          }
        />
      )}
    </>
  )

  return convergenceHook.isLarge ? (
    <Box flex={1} flexDirection="row">
      <Box flex={0.1}>
        <LeftSideMenu
          onNodePress={async (query) => {
            const currentQuery = selectedLibrary?.searchSetting?.query ?? ""
            const currentParts = parseQueryParts(currentQuery)
            const normalizedNew = normalizeTagQuery(query)
            const alreadySelected = currentParts.some((q) => normalizeTagQuery(q) === normalizedNew)
            let nextParts: string[]
            let nextOperators: Record<string, QueryOperator>
            if (alreadySelected) {
              nextParts = currentParts.filter((q) => normalizeTagQuery(q) !== normalizedNew)
              const removedParsed = currentParts.find((q) => normalizeTagQuery(q) === normalizedNew)
              const removedItemKey = removedParsed
                ? (() => {
                    const p = parseTagQuery(removedParsed)
                    return p ? buildItemKey(p.categoryKey, p.value) : null
                  })()
                : null
              nextOperators = { ...itemOperators }
              if (removedItemKey) delete nextOperators[removedItemKey]
            } else {
              nextParts = [...currentParts, query.trim()]
              nextOperators = { ...itemOperators }
            }
            setItemOperators(nextOperators)
            const nextQuery = nextParts.reduce((acc, part, i) => {
              if (i === 0) return part
              const prevParsed = parseTagQuery(nextParts[i - 1])
              const prevKey = prevParsed
                ? buildItemKey(prevParsed.categoryKey, prevParsed.value)
                : ""
              const op = nextOperators[prevKey] ?? "AND"
              return `${acc} ${op} ${part}`
            }, "")
            libraryHook.setHeaderSearchText(nextQuery)
            await libraryHook.onSearch(nextQuery)
          }}
          onItemOperatorChange={async (itemKey, op) => {
            const nextOperators = { ...itemOperators, [itemKey]: op }
            setItemOperators(nextOperators)
            const currentQuery = selectedLibrary?.searchSetting?.query ?? ""
            const parts = parseQueryParts(currentQuery)
            const nextQuery = parts.reduce((acc, part, i) => {
              if (i === 0) return part
              const prevParsed = parseTagQuery(parts[i - 1])
              const prevKey = prevParsed
                ? buildItemKey(prevParsed.categoryKey, prevParsed.value)
                : ""
              const partOp = nextOperators[prevKey] ?? "AND"
              return `${acc} ${partOp} ${part}`
            }, "")
            libraryHook.setHeaderSearchText(nextQuery)
            await libraryHook.onSearch(nextQuery)
          }}
          onItemCalibreOperatorChange={async (categoryKey, value, newOp) => {
            const itemKey = buildItemKey(categoryKey, value)
            const oldOp = itemCalibreOperators[itemKey] ?? "="
            setItemCalibreOperators((prev) => ({ ...prev, [itemKey]: newOp }))
            const currentQuery = selectedLibrary?.searchSetting?.query ?? ""
            const parts = parseQueryParts(currentQuery)
            const oldNorm = normalizeTagQuery(buildTagQuery(categoryKey, value, oldOp))
            const updatedParts = parts.map((p) =>
              normalizeTagQuery(p) === oldNorm ? buildTagQuery(categoryKey, value, newOp) : p,
            )
            if (updatedParts.some((p, i) => p !== parts[i])) {
              const nextQuery = updatedParts.reduce((acc, part, i) => {
                if (i === 0) return part
                const prevParsed = parseTagQuery(updatedParts[i - 1])
                const prevKey = prevParsed
                  ? buildItemKey(prevParsed.categoryKey, prevParsed.value)
                  : ""
                const op = itemOperators[prevKey] ?? "AND"
                return `${acc} ${op} ${part}`
              }, "")
              libraryHook.setHeaderSearchText(nextQuery)
              await libraryHook.onSearch(nextQuery)
            }
          }}
          tagBrowser={selectedLibrary?.tagBrowser}
          itemOperators={itemOperators}
          itemCalibreOperators={itemCalibreOperators}
          selectedNames={parseQueryParts(selectedLibrary?.searchSetting?.query ?? "")}
        />
      </Box>
      <Box flex={1}>{LibraryCore}</Box>
    </Box>
  ) : (
    LibraryCore
  )
})
