import { useConvergence } from "@/hooks/useConvergence"
import { useStores } from "@/models"
import type { Book } from "@/models/calibre"
import { api } from "@/services/api"
import { logger } from "@/utils/logger"
import type { DocumentPickerAsset } from "expo-document-picker"
import { useEffect, useState } from "react"
export type LibraryViewStyle = "gridView" | "viewList"
export type LibrarySelectionMode = "none" | "single" | "multi"

export function useLibrary() {
  const { calibreRootStore, settingStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary

  const [searching, setSearching] = useState(false)
  const [selectionState, setSelectionState] = useState<{
    mode: LibrarySelectionMode
    selectedBookIds: Set<number>
  }>({
    mode: "none",
    selectedBookIds: new Set(),
  })
  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")
  const [headerSearchText, setHeaderSearchText] = useState(
    selectedLibrary?.searchSetting?.query ?? "",
  )

  const convergenceHook = useConvergence()
  const { mode: selectionMode, selectedBookIds } = selectionState

  const isSelectionMode = selectionMode === "multi"

  const handleBookPress = (bookId: number) => {
    setSelectionState((prev) => {
      if (prev.mode === "multi") {
        const nextIds = new Set(prev.selectedBookIds)
        if (nextIds.has(bookId)) {
          nextIds.delete(bookId)
        } else {
          nextIds.add(bookId)
        }

        return {
          mode: nextIds.size > 0 ? "multi" : "none",
          selectedBookIds: nextIds,
        }
      }

      return {
        mode: "single",
        selectedBookIds: new Set([bookId]),
      }
    })
  }

  const enterMultiSelection = (bookId: number) => {
    setSelectionState((prev) => {
      const nextIds = new Set(prev.selectedBookIds)
      nextIds.add(bookId)

      return {
        mode: "multi",
        selectedBookIds: nextIds,
      }
    })
  }

  const toggleBookSelection = (bookId: number) => {
    setSelectionState((prev) => {
      const next = new Set(prev.selectedBookIds)
      if (next.has(bookId)) {
        next.delete(bookId)
      } else {
        next.add(bookId)
      }

      return {
        mode:
          next.size === 0 ? "none" : prev.mode === "single" && next.size === 1 ? "single" : "multi",
        selectedBookIds: next,
      }
    })
  }

  const areAllBooksSelected = (bookIds: number[]) => {
    return bookIds.length > 0 && bookIds.every((bookId) => selectedBookIds.has(bookId))
  }

  const toggleBooksSelection = (bookIds: number[]) => {
    if (bookIds.length === 0) {
      return
    }

    setSelectionState((prev) => {
      const next = new Set(prev.selectedBookIds)
      const allSelected = bookIds.every((bookId) => next.has(bookId))

      for (const bookId of bookIds) {
        if (allSelected) {
          next.delete(bookId)
        } else {
          next.add(bookId)
        }
      }

      return {
        mode: next.size === 0 ? "none" : "multi",
        selectedBookIds: next,
      }
    })
  }

  const clearSelection = () => {
    setSelectionState({
      mode: "none",
      selectedBookIds: new Set(),
    })
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
   * Order: metadata names (without operator), boolean keywords, metadata with all operators.
   * This allows staged autocomplete:
   * 1. First shows metadata names (e.g., "title", "author")
   * 2. Then shows boolean operators (e.g., "AND", "OR", "NOT")
   * 3. Finally shows metadata with operators (e.g., "title:=", "title:~", "title:!=", "title:!~")
   */
  const getSearchSuggestions = (): string[] => {
    const metadataNames = searchParameterCandidates
    const operators = [":=", ":~", ":!=", ":!~"]
    const fieldWithOperators = searchParameterCandidates.flatMap((f) =>
      operators.map((op) => `${f}${op}`),
    )
    return [...metadataNames, "AND", "OR", "NOT", ...fieldWithOperators]
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

    // Return the metadata name with colon only, let user choose operator from suggestions
    return `${prefixText}${matches[0]}:`
  }

  const completeOperator = (text: string) => {
    const lastSpaceIndex = text.lastIndexOf(" ")
    const prefixText = lastSpaceIndex >= 0 ? text.slice(0, lastSpaceIndex + 1) : ""
    const token = lastSpaceIndex >= 0 ? text.slice(lastSpaceIndex + 1) : text

    // Check if token ends with a colon followed by an operator prefix (e.g., "title:!", "title:~")
    const colonIndex = token.indexOf(":")
    if (colonIndex === -1) {
      return text
    }

    const metadataPart = token.slice(0, colonIndex)
    const afterColon = token.slice(colonIndex + 1)

    // If nothing after colon or just starting to type operator, don't complete
    if (afterColon.length === 0) {
      return text
    }

    const operators = ["=", "~", "!=", "!~"]
    const matches = operators.filter((op) => op.startsWith(afterColon))

    if (matches.length === 1) {
      return `${prefixText}${metadataPart}:${matches[0]}`
    }

    return text
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
    completeOperator,
    getSearchSuggestions,
    selectionMode,
    selectedBookIds,
    isSelectionMode,
    handleBookPress,
    enterMultiSelection,
    toggleBookSelection,
    toggleBooksSelection,
    areAllBooksSelected,
    clearSelection,
    isBookSelected,
    selectedBooks,
  }
}
