import { BookPage, BookViewer, type RenderPageProps } from "@/components"
import useOrientation from "@/hooks/useOrientation"
import { useStores } from "@/models"
import type { Metadata } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators"
import { isRemoteBookImagePath } from "@/utils/bookImageCache"
import { logger } from "@/utils/logger"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { type FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useModal } from "react-native-modalfy"
import type { ModalStackParams } from "@/components/Modals/Types"

export const ViewerScreen: FC = observer(() => {
  const { authenticationStore, calibreRootStore } = useStores()
  const [_, setRefresh] = useState<object>({})
  const [initialPage, setInitialPage] = useState(0)
  const [viewerReady, setViewerReady] = useState(false)
  const handledPromptKeyRef = useRef<string | undefined>()
  const handledRatingPromptKeyRef = useRef<string | undefined>()
  const navigation = useNavigation<ApppNavigationProp>()
  const modal = useModal<ModalStackParams>()
  const selectedLibrary = calibreRootStore.selectedLibrary

  useOrientation(() => {
    setRefresh({})
  })
  const selectedBook = selectedLibrary?.selectedBook

  useLayoutEffect(() => {
    logger.debug("ViewerScreen selectedBook", selectedBook)
    if (!selectedBook) {
      navigation.navigate("Library")
    }
  }, [selectedBook, navigation])

  if (!selectedLibrary || !selectedBook) {
    return undefined
  }

  const selectedFormat = selectedBook.metaData.selectedFormat
  const histories = calibreRootStore.readingHistories.filter((value) => {
    return value.bookId === selectedBook.id && value.libraryId === selectedLibrary.id
  })
  const history =
    histories.find((value) => {
      return (
        selectedFormat !== null && selectedFormat !== undefined && value.format === selectedFormat
      )
    }) ?? histories[histories.length - 1]

  useEffect(() => {
    if (!selectedFormat && history?.format) {
      selectedBook.metaData.setProp("selectedFormat", history.format)
    }
  }, [history?.format, selectedBook, selectedFormat])

  const cachedPathList = history?.cachedPath
  const totalPage = cachedPathList?.length ?? selectedBook.path.length
  const promptKey = useMemo(() => {
    return `${selectedLibrary.id}:${selectedBook.id}:${history?.format ?? ""}`
  }, [history?.format, selectedBook.id, selectedLibrary.id])

  useEffect(() => {
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
  }, [history, modal, promptKey, totalPage])

  const renderPage = (props: RenderPageProps) => {
    const pagePath = cachedPathList?.[props.page] ?? selectedBook.path[props.page]
    const isRemotePath = isRemoteBookImagePath(pagePath)
    return (
      <BookPage
        source={{
          uri: pagePath,
          headers: isRemotePath ? authenticationStore.getHeader() : undefined,
        }}
      />
    )
  }

  if (!viewerReady) {
    return undefined
  }

  return (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={totalPage}
      initialPage={initialPage}
      onPageChange={async (page) => {
        if (history?.currentPage !== page) {
          history?.setCurrentPage(page)
        }

        const isLastPage = totalPage > 0 && page >= totalPage - 1
        if (!isLastPage || handledRatingPromptKeyRef.current === promptKey) {
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
      }}
    />
  )
})
