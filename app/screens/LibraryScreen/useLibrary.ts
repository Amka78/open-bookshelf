import { useConvergence } from "@/hooks/useConvergence"
import { useStores } from "@/models"
import type { Book } from "@/models/calibre"
import { api } from "@/services/api"
import { logger } from "@/utils/logger"
import type { DocumentPickerAsset } from "expo-document-picker"
import { useEffect, useState } from "react"
export type LibraryViewStyle = "gridView" | "viewList"
export function useLibrary() {
  const { calibreRootStore, settingStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary

  const [searching, setSearching] = useState(false)
  const [selectedBookIds, setSelectedBookIds] = useState<Set<number>>(new Set())
  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")
  const [headerSearchText, setHeaderSearchText] = useState(
    selectedLibrary?.searchSetting?.query ?? "",
  )

  const convergenceHook = useConvergence()

  const isSelectionMode = selectedBookIds.size > 0

  const toggleBookSelection = (bookId: number) => {
    setSelectedBookIds((prev) => {
      const next = new Set(prev)
      if (next.has(bookId)) {
        next.delete(bookId)
      } else {
        next.add(bookId)
      }
      return next
    })
  }

  const clearSelection = () => {
    setSelectedBookIds(new Set())
  }

  const isBookSelected = (bookId: number) => selectedBookIds.has(bookId)

  const selectedBooks = !selectedLibrary
    ? ([] as Book[])
    : (Array.from(selectedBookIds)
        .map((id) => selectedLibrary.books.get(id.toString()))
        .filter(Boolean) as Book[])

  const searchParameterCandidates = !selectedLibrary
    ? ([] as string[])
    : Array.from(
        new Set(
          Array.from(selectedLibrary.fieldMetadataList.values())
            .flatMap((metadata) => metadata.searchTerms.slice())
            .filter((term) => term && term !== "all"),
        ),
      )

  /**
   * Returns autocomplete suggestions for the current search input.
   * Suggests Calibre field names (with `:=` suffix) and boolean keywords.
   */
  const getSearchSuggestions = (): string[] => {
    const fieldSuggestions = searchParameterCandidates.map((f) => `${f}:=`)
    return ["AND", "OR", "NOT", ...fieldSuggestions]
  }

  const completeSearchParameter = (text: string) => {
    const lastSpaceIndex = text.lastIndexOf(" ")
    const prefixText = lastSpaceIndex >= 0 ? text.slice(0, lastSpaceIndex + 1) : ""
    const token = lastSpaceIndex >= 0 ? text.slice(lastSpaceIndex + 1) : text

    if (!token.endsWith(":")) {
      return text
    }

    const rawParameter = token.slice(0, -1).toLowerCase()
    if (!rawParameter) {
      return text
    }

    const matches = searchParameterCandidates.filter((candidate) => {
      return candidate.toLowerCase().startsWith(rawParameter)
    })

    if (matches.length !== 1) {
      return text
    }

    return `${prefixText}${matches[0]}:=`
  }
  const search = async () => {
    setSearching(true)
    try {
      await calibreRootStore.searchLibrary(settingStore.booksPerPage)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    setHeaderSearchText(selectedLibrary?.searchSetting?.query ?? "")
  }, [selectedLibrary?.searchSetting?.query])

  // biome-ignore lint/correctness/useExhaustiveDependencies: MST observable (settingStore.booksPerPage) is tracked via observer(); adding it to deps would cause unnecessary re-fetches
  useEffect(() => {
    const initialize = async () => {
      setSearching(true)
      try {
        await calibreRootStore.searchLibrary(settingStore.booksPerPage)
      } finally {
        setSearching(false)
      }

      calibreRootStore.getTagBrowser()
    }

    void initialize()
  }, [calibreRootStore])

  const onSelectVirtualLibrary = async (vl: string | null) => {
    selectedLibrary.searchSetting.setProp("vl", vl)
    await search()
  }

  const onSearch = async (searchCondition?: string) => {
    selectedLibrary.searchSetting.setProp("query", searchCondition ?? "")
    if (searchCondition) {
      settingStore.addRecentSearch(searchCondition)
    }
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

    logger.debug("onUploadFile", assets)

    try {
      await api.uploadFile(assets[0].name, selectedLibrary.id, assets[0].file ?? assets[0].uri)
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
    onSelectVirtualLibrary,
    onSort,
    searching,
    mobileViewStyle,
    desktopViewStyle,
    headerSearchText,
    setHeaderSearchText,
    searchParameterCandidates,
    completeSearchParameter,
    getSearchSuggestions,
    selectedBookIds,
    isSelectionMode,
    toggleBookSelection,
    clearSelection,
    isBookSelected,
    selectedBooks,
  }
}
