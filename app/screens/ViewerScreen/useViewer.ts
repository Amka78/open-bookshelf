import { useStores } from "@/models"
import type { LibraryMap } from "@/models/CalibreRootStore"
import { type ClientSetting, ClientSettingModel } from "@/models/calibre"
import type { Metadata } from "@/models/calibre"
import type { AppStackParamList } from "@/navigators"
import type { BookReadingStyleType } from "@/type/types"
import type { ModalStackParams } from "@/components/Modals/Types"
import { type RouteProp, useRoute } from "@react-navigation/native"
import { useEffect, useMemo, useRef, useState } from "react"
import { useModal } from "react-native-modalfy"
import { useConvergence } from "../../hooks/useConvergence"

type OrientationType = "vertical" | "horizontal"
type ViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">

export function useViewer() {
  const { calibreRootStore } = useStores()
  const modal = useModal<ModalStackParams>()

  const [showMenu, setShowMenu] = useState(false)
  const [initialPage, setInitialPage] = useState(0)
  const [viewerReady, setViewerReady] = useState(false)
  const handledPromptKeyRef = useRef<string | undefined>()
  const handledRatingPromptKeyRef = useRef<string | undefined>()

  const convergenceHook = useConvergence()

  const orientation = convergenceHook.orientation
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary?.selectedBook

  // Reading history and format management
  const selectedFormat = selectedBook?.metaData.selectedFormat
  const histories = selectedBook
    ? calibreRootStore.readingHistories.filter((value) => {
        return value.bookId === selectedBook.id && value.libraryId === selectedLibrary!.id
      })
    : []

  const history = selectedBook
    ? histories.find((value) => {
        return (
          selectedFormat !== null && selectedFormat !== undefined && value.format === selectedFormat
        )
      }) ?? histories[histories.length - 1]
    : undefined

  // Update selected format if needed
  useEffect(() => {
    if (selectedBook && !selectedFormat && history?.format) {
      selectedBook.metaData.setProp("selectedFormat", history.format)
    }
  }, [history?.format, selectedBook, selectedFormat])

  // Calculate cached path and total page
  const cachedPathList = history?.cachedPath
  const totalPage = selectedBook
    ? cachedPathList?.length ?? selectedBook.path.length
    : 0

  // Create prompt key for resume reading logic
  const promptKey = useMemo(() => {
    if (!selectedBook || !selectedLibrary) {
      return ""
    }
    return `${selectedLibrary.id}:${selectedBook.id}:${history?.format ?? ""}`
  }, [history?.format, selectedBook?.id, selectedLibrary?.id])

  // Handle resume reading prompt
  useEffect(() => {
    if (!selectedBook || !selectedLibrary) {
      return
    }

    if (!history || history.currentPage <= 0) {
      handledPromptKeyRef.current = promptKey
      setInitialPage(0)
      setViewerReady(true)
      return
    }

    if (handledPromptKeyRef.current === promptKey) {
      setViewerReady(true)
      return
    }

    handledPromptKeyRef.current = promptKey
    setViewerReady(false)

    const resumePage = Math.max(0, Math.min(history.currentPage, Math.max(totalPage - 1, 0)))
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
  }, [history, modal, promptKey, totalPage, selectedBook, selectedLibrary])

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
    totalPage,
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
