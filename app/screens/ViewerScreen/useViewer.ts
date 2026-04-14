import type { TocItem } from "@/components/Modals/Types"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { useStores } from "@/models"
import type { LibraryMap } from "@/models/CalibreRootStore"
import { type ClientSetting, ClientSettingModel } from "@/models/calibre"
import type { MetadataSnapshotIn } from "@/models/calibre"
import { api } from "@/services/api"
import type { BookReadingStyleType } from "@/type/types"
import { isCalibreHtmlViewerFormat, isCalibreSerializedHtmlPath } from "@/utils/calibreHtmlViewer"
import { generateCfiForPage } from "@/utils/cfi"
import { logger } from "@/utils/logger"
import { useEffect, useMemo, useRef, useState } from "react"
import { useConvergence } from "../../hooks/useConvergence"

const SYNC_DEBOUNCE_MS = 1000

/**
 * Convert a Blob to a data URL string.
 * Uses FileReader when available (browser), falls back to manual btoa for
 * test environments (bun).
 */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof FileReader !== "undefined") {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Fallback for environments without FileReader (e.g., bun tests)
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const chunkSize = 8192
  let binary = ""
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
    binary += String.fromCharCode.apply(null, Array.from(chunk))
  }
  return `data:${blob.type || "application/octet-stream"};base64,${btoa(binary)}`
}

const runOnNextFrame = (callback: () => void) => {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(() => {
      callback()
    })
  }

  return setTimeout(callback, 0) as unknown as number
}

const cancelScheduledFrame = (id: number) => {
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(id)
    return
  }

  clearTimeout(id)
}

export function useViewer() {
  const { calibreRootStore } = useStores()
  const modal = useElectrobunModal()

  const [showMenu, setShowMenu] = useState(false)
  const [initialPage, setInitialPage] = useState(0)
  const [viewerReady, setViewerReady] = useState(false)
  const resolvedPromptKeyRef = useRef<string | undefined>(undefined)
  const pendingPromptKeyRef = useRef<string | undefined>(undefined)
  const handledRatingPromptKeyRef = useRef<string | undefined>(undefined)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const resumePageRef = useRef<number>(0)

  const convergenceHook = useConvergence()

  const orientation = convergenceHook.orientation
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedLibraryId = selectedLibrary?.id
  const selectedBook = selectedLibrary?.selectedBook

  // Reading history and format management
  const selectedFormat = selectedBook?.metaData.selectedFormat
  const isHtmlViewerFormat = isCalibreHtmlViewerFormat(selectedFormat)
  const normalizedSelectedFormat = selectedFormat?.toUpperCase()
  const histories = useMemo(
    () =>
      selectedBook && selectedLibraryId
        ? calibreRootStore.readingHistories.filter((value) => {
            return value.bookId === selectedBook.id && value.libraryId === selectedLibraryId
          })
        : [],
    [selectedBook, selectedLibraryId, calibreRootStore.readingHistories],
  )

  const history = useMemo(() => {
    return selectedBook
      ? histories.find((value) => {
          return (
            normalizedSelectedFormat !== null &&
            normalizedSelectedFormat !== undefined &&
            value.format.toUpperCase() === normalizedSelectedFormat
          )
        }) ?? (!normalizedSelectedFormat ? histories[histories.length - 1] : undefined)
      : undefined
  }, [selectedBook, histories, normalizedSelectedFormat])

  // Update selected format if needed
  useEffect(() => {
    if (selectedBook && !selectedFormat && history?.format) {
      selectedBook.metaData.setProp("selectedFormat", history.format)
    }
  }, [history?.format, selectedBook, selectedFormat])

  // Restore cached CBZ metadata if available
  // Note: CBZ metadata is now stored in ReadingHistory, not BookModel
  // The metadata is automatically available via history.isComic, etc.
  useEffect(() => {
    if (!selectedBook || !history) return

    if (history.isComic !== null || history.rasterCoverName !== null || history.totalLength !== null) {
      logger.debug("CBZ metadata available from history", {
        bookId: selectedBook.id,
        isComic: history.isComic,
        totalLength: history.totalLength,
        hashMatch: history.bookHash === (selectedBook.hash ?? 0),
      })
    }
  }, [selectedBook, history])

  // The book spine/path list is the authoritative page source for the viewer.
  // Cached paths are only optional render replacements for image-based formats.
  const cachedPathList = history?.cachedPath?.length ? history.cachedPath : undefined
  const availablePathLength =
    selectedBook?.path.length && selectedBook.path.length > 0
      ? selectedBook.path.length
      : isHtmlViewerFormat
        ? 0
        : cachedPathList?.length ?? 0

  // Create prompt key for resume reading logic
  const promptKey =
    selectedBook && selectedLibrary
      ? `${selectedLibrary.id}:${selectedBook.id}:${history?.format ?? ""}`
      : ""

  // Compute the best resume page: prefer local currentPage, fall back to server pos_frac.
  const serverEstimatedPage =
    history &&
    history.currentPage <= 0 &&
    typeof history.serverPosFrac === "number" &&
    history.serverPosFrac > 0 &&
    availablePathLength > 1
      ? Math.round(history.serverPosFrac * (availablePathLength - 1))
      : -1

  // Handle resume reading prompt
  useEffect(() => {
    let cleanup = () => {}

    const hasLocalProgress = !!(history && history.currentPage > 0)
    const hasServerProgress = serverEstimatedPage >= 0

    if (!hasLocalProgress && !hasServerProgress) {
      resolvedPromptKeyRef.current = promptKey
      pendingPromptKeyRef.current = undefined
      setInitialPage(0)
      setViewerReady(true)
      logger.debug("No reading history or at first page, starting from the beginning", {
        promptKey,
      })
    } else if (resolvedPromptKeyRef.current === promptKey) {
      setViewerReady(true)
    } else if (pendingPromptKeyRef.current === promptKey) {
      setViewerReady(false)
    } else {
      pendingPromptKeyRef.current = promptKey
      setViewerReady(false)

      const maxPage = Math.max(availablePathLength - 1, 0)
      const resumePage = hasLocalProgress
        ? Math.max(0, Math.min(history?.currentPage ?? 0, maxPage))
        : Math.max(0, Math.min(serverEstimatedPage, maxPage))

      // Store in ref so callbacks always use the latest value
      resumePageRef.current = resumePage

      let secondFrame: number | undefined
      const firstFrame = runOnNextFrame(() => {
        secondFrame = runOnNextFrame(() => {
          if (pendingPromptKeyRef.current !== promptKey) {
            return
          }

          modal.openModal("ConfirmModal", {
            titleTx: "modal.resumeReadingConfirmModal.title",
            messageTx: "modal.resumeReadingConfirmModal.message",
            okTx: "common.yes",
            cancelTx: "common.no",
            onOKPress: () => {
              pendingPromptKeyRef.current = undefined
              resolvedPromptKeyRef.current = promptKey
              setInitialPage(resumePageRef.current)
              setViewerReady(true)
            },
            onCancelPress: () => {
              pendingPromptKeyRef.current = undefined
              resolvedPromptKeyRef.current = promptKey
              setInitialPage(0)
              setViewerReady(true)
            },
          })
        })
      })
      cleanup = () => {
        cancelScheduledFrame(firstFrame)
        if (secondFrame !== undefined) {
          cancelScheduledFrame(secondFrame)
        }
      }
    }

    return cleanup
  }, [availablePathLength, promptKey, serverEstimatedPage, history?.currentPage, history?.serverPosFrac, history?.format, modal])

  // Client setting management
  let tempClientSetting = selectedBook
    ? selectedLibrary?.clientSetting?.find((value) => {
        return value.id === selectedBook.id
      })
    : undefined

  if (selectedBook && !tempClientSetting) {
    tempClientSetting = ClientSettingModel.create({
      id: selectedBook.id,
      verticalReadingStyle: "singlePage",
      verticalPageDirection: "left",
      horizontalReadingStyle: "facingPageWithTitle",
      horizontalPageDirection: "left",
    })
  }

  const pageDirection = tempClientSetting
    ? orientation === "horizontal"
      ? tempClientSetting.horizontalPageDirection
      : tempClientSetting.verticalPageDirection
    : "left"

  const readingStyle = tempClientSetting
    ? orientation === "horizontal"
      ? tempClientSetting.horizontalReadingStyle
      : tempClientSetting.verticalReadingStyle
    : "singlePage"

  const onSetBookReadingStyle = (style: BookReadingStyleType) => {
    if (tempClientSetting && selectedBook && selectedLibrary) {
      tempClientSetting.setProp(`${orientation}ReadingStyle`, style)
      updateClientSetting(selectedLibrary, selectedBook.id, tempClientSetting)
    }
  }

  const onSetPageDirection = (pageDirection: "left" | "right") => {
    if (tempClientSetting && selectedBook && selectedLibrary) {
      tempClientSetting.setProp(`${orientation}PageDirection`, pageDirection)
      updateClientSetting(selectedLibrary, selectedBook.id, tempClientSetting)
    }
  }

  const onPageChange = async (page: number) => {
    if (!selectedBook || !selectedLibraryId || !history) {
      return
    }

    // Skip if page hasn't changed (avoid redundant API calls)
    if (history.currentPage === page) {
      return
    }

    // Always update local currentPage
    history.setCurrentPage(page)

    // Compute position fraction and schedule server sync
    const totalPages = selectedBook.path.length || 1
    const posFrac = totalPages > 1 ? page / (totalPages - 1) : 0
    const epoch = Math.floor(Date.now() / 1000)
    history.setServerPosition(posFrac, epoch)

    // Generate proper CFI for the current page
    const cfi = generateCfiForPage(page)

    // Debounce server sync to avoid excessive API calls during rapid page turns
    clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      // Sync with both the legacy endpoint (app-internal) and the standard Calibre endpoint.
      Promise.all([
        api
          .syncReadingPositionFull(selectedLibraryId, selectedBook.id, history.format, posFrac, cfi)
          .catch((err) => logger.warn("Failed to sync reading position (standard)", err)),
      ])
    }, SYNC_DEBOUNCE_MS)
  }

  // Flush pending position sync when viewer unmounts
  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== undefined) {
        clearTimeout(syncTimerRef.current)
        syncTimerRef.current = undefined
      }
    }
  }, [])

  // Send initial position to server when viewer becomes ready
  useEffect(() => {
    if (!viewerReady || !selectedBook || !selectedLibraryId || !history) {
      return
    }

    const currentPage = history.currentPage ?? initialPage ?? 0
    const totalPages = selectedBook.path.length || 1
    const posFrac = totalPages > 1 ? currentPage / (totalPages - 1) : 0
    const epoch = Math.floor(Date.now() / 1000)
    const cfi = generateCfiForPage(currentPage)

    history.setServerPosition(posFrac, epoch)

    // Sync initial position to server without debounce
    api
      .syncReadingPositionFull(
        selectedLibraryId,
        selectedBook.id,
        history.format,
        posFrac,
        cfi,
        epoch,
      )
      .catch((err) => logger.warn("Failed to sync initial reading position (standard)", err))
  }, [viewerReady, selectedBook, selectedLibraryId, history, initialPage])

  const onLastPage = () => {
    if (!selectedBook || !selectedLibrary) {
      return
    }

    if (handledRatingPromptKeyRef.current === promptKey) {
      return
    }

    handledRatingPromptKeyRef.current = promptKey
    modal.openModal("ViewerRatingModal", {
      initialRating: selectedBook.metaData.rating ?? 0,
      onSubmit: async (rating: number) => {
        const result = await selectedBook.update(
          selectedLibrary.id,
          { rating } as Partial<MetadataSnapshotIn>,
          ["rating"],
        )

        if (!result) {
          modal.openModal("ErrorModal", {
            titleTx: "common.error",
            message: "Failed to update rating.",
          })
        }
      },
    })
  }

  const onSetCoverByPage = async (page: number) => {
    if (!selectedBook || !selectedLibrary) {
      logger.warn("[onSetCoverByPage] No selectedBook or selectedLibrary")
      return false
    }

    const selectedFormat = selectedBook.metaData?.selectedFormat
    const hash = selectedBook.hash
    const size = selectedBook.metaData?.size ?? 0

    // Use the same source path resolution as ViewerScreen:
    // selectedBook.path first, then cachedPathList as fallback for image-based formats.
    const sourcePath = selectedBook.path?.[page] ?? cachedPathList?.[page]

    if (!sourcePath || !selectedFormat || hash === null || hash === undefined) {
      logger.warn("[onSetCoverByPage] Missing sourcePath/format/hash", {
        sourcePath,
        selectedFormat,
        hash,
        bookPathLength: selectedBook.path?.length,
        cachedPathListLength: cachedPathList?.length,
      })
      modal.openModal("ErrorModal", {
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      })
      return false
    }

    // HTML spine paths (AZW3 / KF8 / text-based formats) are not images — cannot use as cover
    if (isCalibreSerializedHtmlPath(sourcePath)) {
      logger.warn("[onSetCoverByPage] Page is HTML, not an image", { sourcePath })
      modal.openModal("ErrorModal", {
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      })
      return false
    }

    try {
      // Determine the fetch URL.
      // cachedPathList entries on web are already full URLs (http://…); use them directly.
      // selectedBook.path entries are relative paths that need getBookFileUrl.
      const isFullUrl = sourcePath.startsWith("http://") || sourcePath.startsWith("https://")
      const coverSourceUrl = isFullUrl
        ? sourcePath
        : api.getBookFileUrl(
            selectedBook.id,
            selectedFormat,
            size,
            hash,
            sourcePath,
            selectedLibrary.id,
          )
      logger.debug("[onSetCoverByPage] Fetching image", { coverSourceUrl })

      const sourceResponse = await api.fetchWithAuth(coverSourceUrl, { method: "GET" })
      logger.debug("[onSetCoverByPage] Fetch response", {
        ok: sourceResponse.ok,
        status: sourceResponse.status,
        contentType: sourceResponse.headers.get("content-type"),
      })

      if (!sourceResponse.ok) {
        logger.warn("[onSetCoverByPage] Image fetch failed", {
          status: sourceResponse.status,
        })
        modal.openModal("ErrorModal", {
          titleTx: "common.error",
          messageTx: "viewerMenu.failedToUpdateCover",
        })
        return false
      }

      const blob = await sourceResponse.blob()
      const blobType = (blob.type || "").toLowerCase()
      logger.debug("[onSetCoverByPage] Blob obtained", {
        size: blob.size,
        type: blobType,
      })

      if (blob.size === 0) {
        logger.warn("[onSetCoverByPage] Empty blob")
        modal.openModal("ErrorModal", {
          titleTx: "common.error",
          messageTx: "viewerMenu.failedToUpdateCover",
        })
        return false
      }

      // Verify the response is actually an image
      if (
        !blobType.includes("image/png") &&
        !blobType.includes("image/jpeg") &&
        !blobType.includes("image/jpg")
      ) {
        logger.warn("[onSetCoverByPage] Not an image", { blobType })
        modal.openModal("ErrorModal", {
          titleTx: "common.error",
          messageTx: "viewerMenu.failedToUpdateCover",
        })
        return false
      }

      // 2) Try binary upload via cdb/set-cover (uses apisauce/axios auth)
      logger.debug("[onSetCoverByPage] Trying setCoverBinary (cdb/set-cover)")
      const binaryResult = await api.setCoverBinary(selectedLibrary.id, selectedBook.id, blob)
      if (binaryResult.kind === "ok") {
        logger.debug("[onSetCoverByPage] setCoverBinary succeeded")
        return true
      }
      logger.warn("[onSetCoverByPage] setCoverBinary failed, trying data URL fallback", {
        kind: binaryResult.kind,
      })

      // 3) Fallback: convert to data URL and use cdb/set-fields (same path as BookEditScreen)
      const dataUrl = await blobToDataUrl(blob)
      logger.debug("[onSetCoverByPage] Data URL ready", {
        length: dataUrl.length,
        prefix: dataUrl.slice(0, 40),
      })

      const updateSuccess: boolean = await selectedBook.update(
        selectedLibrary.id,
        { cover: dataUrl } as MetadataSnapshotIn,
        ["cover"],
      )

      if (updateSuccess) {
        logger.debug("[onSetCoverByPage] update via set-fields succeeded")
        return true
      }

      logger.warn("[onSetCoverByPage] Both approaches failed")
      modal.openModal("ErrorModal", {
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      })
      return false
    } catch (error) {
      logger.error("[onSetCoverByPage] Unexpected error", error)
      modal.openModal("ErrorModal", {
        titleTx: "common.error",
        messageTx: "viewerMenu.failedToUpdateCover",
      })
      return false
    }
  }

  const onManageMenu = () => {
    setShowMenu(!showMenu)
  }

  const toc: TocItem | null = (selectedBook?.manifestToc as TocItem | null | undefined) ?? null

  const goToTocEntry = (dest: string): number => {
    if (!selectedBook) return 0
    const destPath = dest.split("#")[0]
    const idx = selectedBook.path.findIndex(
      (p) =>
        p === dest ||
        p === destPath ||
        p.endsWith(`/${destPath}`) ||
        p.endsWith(`/${dest}`) ||
        p.includes(destPath),
    )
    return idx >= 0 ? idx : 0
  }

  return {
    orientation,
    onSetBookReadingStyle,
    onSetPageDirection,
    onManageMenu,
    readingStyle,
    pageDirection,
    showMenu,
    initialPage,
    viewerReady,
    cachedPathList,
    selectedBook,
    selectedLibrary,
    onPageChange,
    onLastPage,
    onSetCoverByPage,
    toc,
    goToTocEntry,
  }
}

function updateClientSetting(
  selectedLibrary: LibraryMap,
  libraryId: number,
  clientSetting: ClientSetting,
) {
  const storedClientSetting = selectedLibrary.clientSetting.find((value) => {
    return value.id === libraryId
  })

  if (!storedClientSetting) {
    const array = selectedLibrary.clientSetting.slice()

    array.push(clientSetting)
    selectedLibrary.setProp("clientSetting", array)
  }
}
