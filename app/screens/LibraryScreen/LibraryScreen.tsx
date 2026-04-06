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
  SelectionActionBar,
  SortMenu,
  StaggerContainer,
  VirtualLibraryButton,
} from "@/components"
import { BookListItem } from "@/components/BookListItem"
import { LibraryViewModeButton } from "@/components/LibraryViewModeButton"
import { SearchInputField } from "@/components/SearchInputField"
import type { CalibreFieldOperator, QueryOperator } from "@/components/LeftSideMenu/LeftSideMenu"
import {
  buildItemKey,
  buildTagQuery,
  normalizeTagQuery,
  parseTagQuery,
} from "@/components/LeftSideMenu/LeftSideMenu"
import { useBulkDownloadBooks } from "@/hooks/useBulkDownloadBooks"
import { useConvergence } from "@/hooks/useConvergence"
import { useDeleteBook } from "@/hooks/useDeleteBook"
import { useDownloadBook } from "@/hooks/useDownloadBook"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { useOpenViewer } from "@/hooks/useOpenViewer"
import { useStores } from "@/models"
import type { Book } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { api } from "@/services/api"
import { deleteCachedBookImages } from "@/utils/bookImageCache"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type React from "react"
import { type FC, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Platform, useWindowDimensions } from "react-native"
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
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

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

  const viewMode = settingStore.libraryViewMode
  const handleToggleViewMode = () => {
    settingStore.setLibraryViewMode(viewMode === "grid" ? "list" : "grid")
  }

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

  const thumbnailSourceCacheRef = useRef<
    Map<
      Book["id"],
      {
        authStateVersion: number
        source: { uri: string; headers: Record<string, string> | undefined }
      }
    >
  >(new Map())

  const bookList = selectedLibrary?.books ? Array.from(selectedLibrary.books.values()) : []

  // O(1) lookup for cached books instead of O(n) scan per renderItem
  const cachedBookIds = (() => {
    const set = new Set<number>()
    for (const h of calibreRootStore.readingHistories) {
      if (h.libraryId === selectedLibrary?.id && h.cachedPath.length > 0) {
        set.add(h.bookId)
      }
    }
    return set
  })()

  // Build readingProgress map (best serverPosFrac per book) for the progress bar
  const readingProgressById = (() => {
    const map = new Map<number, number>()
    for (const h of calibreRootStore.readingHistories) {
      if (
        h.libraryId === selectedLibrary?.id &&
        typeof h.serverPosFrac === "number" &&
        h.serverPosFrac > 0
      ) {
        const existing = map.get(h.bookId)
        if (existing === undefined || h.serverPosFrac > existing) {
          map.set(h.bookId, h.serverPosFrac)
        }
      }
    }
    return map
  })()

  const thumbnailSourceById = (() => {
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

    return nextCache
  })()

  useEffect(() => {
    thumbnailSourceCacheRef.current = thumbnailSourceById
  }, [thumbnailSourceById])

  const libraryActions = (
    <>
      <IconButton
        name="cog"
        iconSize="md-"
        onPress={() => {
          modal.openModal("UserPreferencesModal", {})
        }}
      />
      <IconButton
        name="progress-clock"
        iconSize="md-"
        onPress={() => {
          modal.openModal("JobQueueModal", {})
        }}
      />
      <IconButton
        name="chart-bar"
        onPress={() => {
          modal.openModal("ReadingStatsModal", {})
        }}
        iconSize="md-"
      />
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
      <LibraryViewModeButton mode={viewMode} onToggle={handleToggleViewMode} />
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
      headerTitle: () => (
        <HStack alignItems="center" flex={1}>
          <SearchInputField
            value={libraryHook.headerSearchText}
            onChangeText={(text) => {
              libraryHook.setHeaderSearchText(libraryHook.completeSearchParameter(text))
            }}
            onSubmit={(text) => {
              libraryHook.onSearch(text)
            }}
            suggestions={libraryHook.getSearchSuggestions()}
            placeholderTx={
              selectedLibrary?.ftsEnabled
                ? "libraryScreen.searchPlaceholderFts"
                : "libraryScreen.searchPlaceholder"
            }
            size="sm"
            width={convergenceHook.isLarge ? 280 : "100%"}
            testID="library-search-input"
            savedSearches={selectedLibrary?.savedSearches?.slice() ?? []}
            onSaveSearch={(name, query) => {
              selectedLibrary?.addSavedSearch(name, query)
            }}
            onLoadSearch={(query) => {
              libraryHook.setHeaderSearchText(query)
              libraryHook.onSearch(query)
            }}
            recentSearches={settingStore.recentSearches.slice()}
          />
        </HStack>
      ),
      headerRight: convergenceHook.isLarge
        ? () => {
            return <HStack space="sm">{libraryActions}</HStack>
          }
        : undefined,
    })
  }, [
    convergenceHook.isLarge,
    libraryHook,
    libraryActions,
    navigation,
    selectedLibrary,
    viewMode,
  ])

  const renderItem = ({ item }: { item: Book }) => {
    const onPress = async () => {
      selectedLibrary.setBook(item.id)
      await openViewerHook.execute(modal)
    }

    let listItem: React.JSX.Element
    const hasReadingHistory = cachedBookIds.has(item.id)
    const readingProgress = readingProgressById.get(item.id) ?? null
    const readStatus = settingStore.getReadStatus(selectedLibrary.id, item.id) as
      | "want-to-read"
      | "reading"
      | "finished"
      | undefined

    const handleSetStatus = (status: "want-to-read" | "reading" | "finished" | null) => {
      settingStore.setReadStatus(selectedLibrary.id, item.id, status)
    }

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

    if (viewMode === "list") {
      listItem = (
        <BookListItem
          book={item}
          source={imageSource}
          readStatus={readStatus}
          readingProgress={readingProgress ?? undefined}
          isCached={hasReadingHistory}
          isSelected={libraryHook.isBookSelected(item.id)}
          onPress={
            libraryHook.isSelectionMode ? () => libraryHook.toggleBookSelection(item.id) : onPress
          }
          onLongPress={onLongPress}
        />
      )
    } else if (libraryHook.currentListStyle === "gridView") {
      listItem = (
        <BookImageItem
          source={imageSource}
          showCachedIcon={hasReadingHistory}
          onCachedIconPress={onClearBookCache}
          readingProgress={readingProgress}
          readStatus={readStatus}
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
                  readStatus: readStatus ?? null,
                  onSetStatus: handleSetStatus,
                }
          }
          selected={libraryHook.isBookSelected(item.id)}
          onSelectToggle={() => libraryHook.toggleBookSelection(item.id)}
        />
      )
    }
    return listItem
  }

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

  const onBulkDelete = () => {
    if (libraryHook.selectedBookIds.size === 0) return
    modal.openModal("ConfirmModal", {
      titleTx: "modal.bulkDeleteConfirmModal.title",
      messageTx: "modal.bulkDeleteConfirmModal.message",
      onOKPress: async () => {
        try {
          const bookIds = Array.from(libraryHook.selectedBookIds)
          await api.deleteBooks(selectedLibrary.id, bookIds)
          libraryHook.clearSelection()
          await libraryHook.onSearch()
        } catch (e) {
          modal.openModal("ErrorModal", {
            titleTx: "common.error",
            message: e instanceof Error ? e.message : String(e),
          })
        }
      },
    })
  }

  const LibraryCore = (
    <>
      {libraryHook.isSelectionMode && (
        <SelectionActionBar
          selectedCount={libraryHook.selectedBookIds.size}
          onBulkEdit={onBulkEdit}
          onBulkDownload={onBulkDownload}
          onBulkDelete={onBulkDelete}
          onClearSelection={libraryHook.clearSelection}
        />
      )}
      {selectedLibrary ? (
        <FlatList<Book>
          key={`${libraryHook.currentListStyle}-${viewMode}`} // to force re-render when list style or view mode changes
          data={bookList}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          numColumns={viewMode === "list" ? 1 : Math.floor(window.width / 242)}
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
