import type { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import type { LibraryMap } from "@/models/CalibreRootStore"
import { type ClientSetting, ClientSettingModel } from "@/models/calibre"
import type { Metadata } from "@/models/calibre"
import type { BookReadingStyleType } from "@/type/types"
import { useEffect, useRef, useState } from "react"
import { useModal } from "react-native-modalfy"
import { useConvergence } from "../../hooks/useConvergence"
import { logger } from "@/utils/logger"

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
  const modal = useModal<ModalStackParams>()

  const [showMenu, setShowMenu] = useState(false)
  const [initialPage, setInitialPage] = useState(0)
  const [viewerReady, setViewerReady] = useState(false)
  const handledPromptKeyRef = useRef<string | undefined>(undefined)
  const handledRatingPromptKeyRef = useRef<string | undefined>(undefined)

  const convergenceHook = useConvergence()

  const orientation = convergenceHook.orientation
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedLibraryId = selectedLibrary?.id
  const selectedBook = selectedLibrary?.selectedBook

  // Reading history and format management
  const selectedFormat = selectedBook?.metaData.selectedFormat
  const normalizedSelectedFormat = selectedFormat?.toUpperCase()
  const histories =
    selectedBook && selectedLibraryId
      ? calibreRootStore.readingHistories.filter((value) => {
          return value.bookId === selectedBook.id && value.libraryId === selectedLibraryId
        })
      : []

  const history = selectedBook
    ? histories.find((value) => {
        return (
          normalizedSelectedFormat !== null &&
          normalizedSelectedFormat !== undefined &&
          value.format.toUpperCase() === normalizedSelectedFormat
        )
      }) ?? (!normalizedSelectedFormat ? histories[histories.length - 1] : undefined)
    : undefined

  // Update selected format if needed
  useEffect(() => {
    if (selectedBook && !selectedFormat && history?.format) {
      selectedBook.metaData.setProp("selectedFormat", history.format)
    }
  }, [history?.format, selectedBook, selectedFormat])

  // The book spine/path list is the authoritative page source for the viewer.
  // Cached paths are only optional render replacements for image-based formats.
  const cachedPathList = history?.cachedPath.length ? history.cachedPath : undefined

  // Create prompt key for resume reading logic
  const promptKey =
    selectedBook && selectedLibrary
      ? `${selectedLibrary.id}:${selectedBook.id}:${history?.format ?? ""}`
      : ""

  // Handle resume reading prompt
  useEffect(() => {
    let cleanup = () => {}

    if (!history || history.currentPage <= 0) {
      handledPromptKeyRef.current = promptKey
      setInitialPage(0)
      setViewerReady(true)
      logger.debug("No reading history or at first page, starting from the beginning", {
        promptKey,
      })
    } else if (handledPromptKeyRef.current === promptKey) {
      setViewerReady(true)
    } else {
      handledPromptKeyRef.current = promptKey
      setViewerReady(false)

      const resumePage = Math.max(
        0,
        Math.min(history.currentPage, Math.max(history.cachedPath.length - 1, 0)),
      )

      let secondFrame: number | undefined
      const firstFrame = runOnNextFrame(() => {
        secondFrame = runOnNextFrame(() => {
          modal.openModal("ConfirmModal", {
            titleTx: "modal.resumeReadingConfirmModal.title",
            messageTx: "modal.resumeReadingConfirmModal.message",
            okTx: "common.yes",
            cancelTx: "common.no",
            onOKPress: () => {
              setInitialPage(resumePage)
              setViewerReady(true)
            },
            onCancelPress: () => {
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
  }, [history, modal, promptKey, selectedBook, selectedLibrary])

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
    if (history?.currentPage !== page) {
      history?.setCurrentPage(page)
    }
  }

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
        const result = await selectedBook.update(selectedLibrary.id, { rating } as Metadata, [
          "rating",
        ])

        if (!result) {
          modal.openModal("ErrorModal", {
            titleTx: "common.error",
            message: "Failed to update rating.",
          })
        }
      },
    })
  }

  const onManageMenu = () => {
    setShowMenu(!showMenu)
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
