import {
  BookImageItem,
  Box,
  FlatList,
  HStack,
  IconButton,
  LeftSideMenu,
  LibraryActions,
  SelectionActionBar,
  SortMenu,
  StaggerContainer,
  VirtualLibraryButton,
} from "@/components"
import { BookListItem } from "@/components/BookListItem"
import type { CalibreFieldOperator, QueryOperator } from "@/components/LeftSideMenu/LeftSideMenu"
import {
  buildItemKey,
  buildTagQuery,
  normalizeTagQuery,
} from "@/components/LeftSideMenu/LeftSideMenu"
import { SearchInputField } from "@/components/SearchInputField"
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
import { type FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Platform, type NativeScrollEvent, type NativeSyntheticEvent, useWindowDimensions } from "react-native"
import { buildThumbnailSourceCache } from "./buildThumbnailSourceCache"
import {
  buildQueryFromParts,
  getLeftSideMenuSelectedNames,
  getNextLeftSideMenuSelectionState,
  parseQueryParts,
} from "./librarySearchState"
import { useLibrary } from "./useLibrary"
import { useLibraryScrollPosition } from "./useLibraryScrollPosition"

type LibrarySearchHeaderProps = {
  convergenceHook: ReturnType<typeof useConvergence>
  libraryHook: ReturnType<typeof useLibrary>
  selectedLibrary: ReturnType<typeof useStores>["calibreRootStore"]["selectedLibrary"]
  settingStore: ReturnType<typeof useStores>["settingStore"]
  onSort: (sortKey: string) => void
  onSelectVirtualLibrary: (vl: string | null) => Promise<void>
}

const LibrarySearchHeader = observer(
  ({
    convergenceHook,
    libraryHook,
    selectedLibrary,
    settingStore,
    onSort,
    onSelectVirtualLibrary,
  }: LibrarySearchHeaderProps) => {
    const [draftText, setDraftText] = useState(libraryHook.headerSearchText)

    // Only sync draft text when headerSearchText changes externally (e.g., after search)
    // Use a ref to track previous value and avoid resetting on every render
    const prevHeaderTextRef = useRef(libraryHook.headerSearchText)

    useEffect(() => {
      if (prevHeaderTextRef.current !== libraryHook.headerSearchText) {
        setDraftText(libraryHook.headerSearchText)
        prevHeaderTextRef.current = libraryHook.headerSearchText
      }
    }, [libraryHook.headerSearchText])

    return (
      <HStack alignItems="center" flex={1} pl={convergenceHook.isLarge ? "$48" : 0} space="sm">
        <Box flex={1} minWidth={0} maxWidth={convergenceHook.isLarge ? 700 : undefined}>
          <SearchInputField
            value={draftText}
            onChangeText={(text) => {
              setDraftText(text)
              libraryHook.setHeaderSearchText(text)
            }}
            onSubmit={(text) => {
              // Apply completion at search time to avoid interfering with IME
              const withParam = libraryHook.completeSearchParameter(text)
              const withOperator = libraryHook.completeOperator(withParam)
              libraryHook.setHeaderSearchText(withOperator)
              libraryHook.onSearch(withOperator)
            }}
            suggestions={libraryHook.getSearchSuggestions()}
            placeholderTx={
              selectedLibrary?.ftsEnabled
                ? "libraryScreen.searchPlaceholderFts"
                : "libraryScreen.searchPlaceholder"
            }
            size="md"
            width="$full"
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
        </Box>
        <VirtualLibraryButton
          virtualLibraries={selectedLibrary?.virtualLibraries?.slice() ?? []}
          selectedVl={selectedLibrary?.searchSetting?.vl}
          onSelect={(name) => {
            void onSelectVirtualLibrary(name)
          }}
          isLargeScreen={convergenceHook.isLarge}
        />
        <SortMenu
          selectedSort={selectedLibrary?.searchSetting?.sort}
          selectedSortOrder={selectedLibrary?.searchSetting?.sortOrder}
          field={selectedLibrary?.sortField}
          onSortChange={onSort}
          isLargeScreen={convergenceHook.isLarge}
        />
      </HStack>
    )
  },
)

export const LibraryScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()

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

  const viewMode = settingStore.getLibraryViewMode(convergenceHook.isLarge)
  const handleToggleViewMode = () => {
    settingStore.setLibraryViewMode(viewMode === "grid" ? "list" : "grid", convergenceHook.isLarge)
  }

  const openViewerHook = useOpenViewer()
  const deleteBookHook = useDeleteBook()
  const downloadBookHook = useDownloadBook()
  const bulkDownloadHook = useBulkDownloadBooks()
  const libraryHook = useLibrary()
  const listRef = useRef<React.ElementRef<typeof FlatList>>(null)
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
  const visibleBookIds = useMemo(() => bookList.map((book) => book.id), [bookList])
  const allVisibleBooksSelected = libraryHook.areAllBooksSelected(visibleBookIds)
  const restoreListScrollOffset = useCallback((offset: number) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ animated: false, offset })
    })
  }, [])
  const { rememberScrollOffset, restoreScrollOffset } = useLibraryScrollPosition({
    libraryId: selectedLibrary?.id,
    isFocused,
    onRestoreOffset: restoreListScrollOffset,
  })

  useEffect(() => {
    if (bookList.length === 0) {
      return
    }

    restoreScrollOffset()
  }, [bookList.length, restoreScrollOffset])

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      rememberScrollOffset(event.nativeEvent.contentOffset.y)
    },
    [rememberScrollOffset],
  )

  // O(1) lookup for cached books instead of O(n) scan per renderItem
  const cachedBookIds = useMemo(() => {
    const set = new Set<number>()
    for (const h of calibreRootStore.readingHistories) {
      if (h.libraryId === selectedLibrary?.id && h.cachedPath.length > 0) {
        set.add(h.bookId)
      }
    }
    return set
  }, [calibreRootStore.readingHistories, selectedLibrary?.id])

  // Build readingProgress map (best serverPosFrac per book) for the progress bar
  const readingProgressById = useMemo(() => {
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
  }, [calibreRootStore.readingHistories, selectedLibrary?.id])

  const thumbnailSourceById = buildThumbnailSourceCache({
    authStateVersion,
    bookList,
    getAuthHeaders: (url) => api.getAuthHeaders(url),
    getBookThumbnailUrl: (bookId, libraryId) => {
      const thumbnailUrl = api.getBookThumbnailUrl(bookId, libraryId)
      const revision = calibreRootStore.getBookThumbnailRevision(libraryId, bookId)
      return `${thumbnailUrl}&rev=${revision}`
    },
    libraryId: selectedLibrary.id,
    previousCache: thumbnailSourceCacheRef.current,
  })

  useEffect(() => {
    thumbnailSourceCacheRef.current = thumbnailSourceById
  }, [thumbnailSourceById])

  const libraryActions = (
    <LibraryActions
      viewMode={viewMode}
      onToggleViewMode={handleToggleViewMode}
      onUploadFile={libraryHook.onUploadFile}
      navigation={navigation}
    />
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: navigation.setOptions is stable; navigation prop is not a dep in React Navigation patterns
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
        <LibrarySearchHeader
          convergenceHook={convergenceHook}
          libraryHook={libraryHook}
          selectedLibrary={selectedLibrary}
          settingStore={settingStore}
          onSort={libraryHook.onSort}
          onSelectVirtualLibrary={libraryHook.onSelectVirtualLibrary}
        />
      ),
      headerRight: convergenceHook.isLarge
        ? () => {
            return <HStack space="sm">{libraryActions}</HStack>
          }
        : undefined,
    })
  }, [convergenceHook.isLarge, libraryHook, libraryActions, navigation, selectedLibrary, viewMode])

  const renderItem = useCallback(
    ({ item }: { item: Book }) => {
      const onPress = async () => {
        selectedLibrary?.setBook(item.id)
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
      const handleBookMetadataSearch = async (query: string) => {
        libraryHook.setHeaderSearchText(query)
        await libraryHook.onSearch(query)
      }

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

      const onOpenBookDetail = () => {
        selectedLibrary.setBook(item.id)
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
              libraryHook.isSelectionMode
                ? async () => libraryHook.toggleBookSelection(item.id)
                : onPress
            }
            onLongPress={libraryHook.isSelectionMode ? undefined : onLongPress}
            onSelectToggle={
              libraryHook.isSelectionMode
                ? () => libraryHook.toggleBookSelection(item.id)
                : undefined
            }
            onAuthorPress={
              libraryHook.isSelectionMode
                ? undefined
                : (author) => {
                    void handleBookMetadataSearch(`authors:=${author}`)
                  }
            }
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
            onOpenBookDetail={libraryHook.isSelectionMode ? undefined : onOpenBookDetail}
            hoverSearchMetadata={
              libraryHook.isSelectionMode
                ? undefined
                : {
                    authors: [...item.metaData.authors],
                    series: item.metaData.series,
                    tags: [...item.metaData.tags],
                    formats: [...item.metaData.formats],
                  }
            }
            onHoverSearchPress={
              libraryHook.isSelectionMode
                ? undefined
                : (query) => {
                    void handleBookMetadataSearch(query)
                  }
            }
            detailMenuProps={
              libraryHook.isSelectionMode
                ? undefined
                : {
                    onOpenBook: onOpenBook,
                    onDownloadBook: onDownloadBook,
                    onOpenBookDetail: onOpenBookDetail,
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
    },
    [
      selectedLibrary,
      openViewerHook,
      deleteBookHook,
      downloadBookHook,
      libraryHook,
      convergenceHook,
      modal,
      navigation,
      cachedBookIds,
      readingProgressById,
      thumbnailSourceById,
      viewMode,
      settingStore,
      calibreRootStore,
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
          allVisibleSelected={allVisibleBooksSelected}
          onToggleVisibleSelection={() => {
            libraryHook.toggleBooksSelection(visibleBookIds)
          }}
          onBulkEdit={onBulkEdit}
          onBulkDownload={onBulkDownload}
          onBulkDelete={onBulkDelete}
          onClearSelection={libraryHook.clearSelection}
          toggleVisibleSelectionDisabled={visibleBookIds.length === 0}
        />
      )}
      {selectedLibrary ? (
        <FlatList<Book>
          ref={listRef}
          key={`${libraryHook.currentListStyle}-${viewMode}`} // to force re-render when list style or view mode changes
          data={bookList}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          numColumns={viewMode === "list" ? 1 : Math.floor(window.width / 242)}
          onContentSizeChange={() => {
            restoreScrollOffset()
          }}
          onRefresh={
            convergenceHook.isLarge
              ? undefined
              : async () => {
                  await libraryHook.onSearch()
                }
          }
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          onEndReached={async () => {
            if (!isFocused) {
              return
            }
            if (calibreRootStore.isFetchingMore) {
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
            const nextSelectionState = getNextLeftSideMenuSelectionState({
              currentSearchText: libraryHook.headerSearchText,
              clickedQuery: query,
              itemOperators,
            })

            if (nextSelectionState.shouldResetMenuSettings) {
              setItemCalibreOperators({})
            }

            setItemOperators(nextSelectionState.nextOperators)
            libraryHook.setHeaderSearchText(nextSelectionState.nextQuery)
            await libraryHook.onSearch(nextSelectionState.nextQuery)
          }}
          onItemOperatorChange={async (itemKey, op) => {
            const nextOperators = { ...itemOperators, [itemKey]: op }
            setItemOperators(nextOperators)
            const currentQuery = libraryHook.headerSearchText
            const parts = parseQueryParts(currentQuery)
            const nextQuery = buildQueryFromParts(parts, nextOperators)
            libraryHook.setHeaderSearchText(nextQuery)
            await libraryHook.onSearch(nextQuery)
          }}
          onItemCalibreOperatorChange={async (categoryKey, value, newOp) => {
            const itemKey = buildItemKey(categoryKey, value)
            const oldOp = itemCalibreOperators[itemKey] ?? "="
            setItemCalibreOperators((prev) => ({ ...prev, [itemKey]: newOp }))
            const currentQuery = libraryHook.headerSearchText
            const parts = parseQueryParts(currentQuery)
            const oldNorm = normalizeTagQuery(buildTagQuery(categoryKey, value, oldOp))
            const updatedParts = parts.map((p) =>
              normalizeTagQuery(p) === oldNorm ? buildTagQuery(categoryKey, value, newOp) : p,
            )
            if (updatedParts.some((p, i) => p !== parts[i])) {
              const nextQuery = buildQueryFromParts(updatedParts, itemOperators)
              libraryHook.setHeaderSearchText(nextQuery)
              await libraryHook.onSearch(nextQuery)
            }
          }}
          onSubCategoryLongPress={(name) => {
            setItemOperators({})
            setItemCalibreOperators({})
            libraryHook.setHeaderSearchText(name)
            libraryHook.onSearch(name)
          }}
          tagBrowser={selectedLibrary?.tagBrowser}
          itemOperators={itemOperators}
          itemCalibreOperators={itemCalibreOperators}
          selectedNames={getLeftSideMenuSelectedNames(libraryHook.headerSearchText)}
        />
      </Box>
      <Box flex={1}>{LibraryCore}</Box>
    </Box>
  ) : (
    LibraryCore
  )
})
