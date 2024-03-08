import { BookViewer, type RenderPageProps } from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { PDF } from "@/library/PDF/Pdf"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { StyleSheet, useWindowDimensions } from "react-native"

export const PDFViewerScreen = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const [totalPages, setTotalPages] = useState(undefined)
  const [imageSize, setImageSize] = useState(undefined)
  const selectedBook = calibreRootStore.selectedLibrary.selectedBook

  const windowDimension = useWindowDimensions()

  let header

  if (authenticationStore.isAuthenticated) {
    header = { Authorization: `Basic ${authenticationStore.token}` }
  }
  const source = {
    uri: `${settingStore.api.baseUrl}/get/PDF/${selectedBook.id}/config?content_disposition=inline`,
    cache: true,
    headers: header,
  }

  const viewerHook = useViewer()

  const renderPage = (renderProps: RenderPageProps) => {
    let alignSelf = "center"

    if (renderProps.pageType === "leftPage") {
      alignSelf = "flex-end"
    } else if (renderProps.pageType === "rightPage") {
      alignSelf = "flex-start"
    }
    return (
      <PDF
        source={source}
        style={[styles.page, { alignSelf, justifyContent: "center" }, imageSize]}
        onLoadComplete={(numberOfPages, path, size) => {
          if (!imageSize) {
            let pdfHeight = size.height
            let pdfWidth = size.width

            if (size.height > windowDimension.height) {
              pdfWidth = pdfWidth * (windowDimension.height / size.height)
              pdfHeight = windowDimension.height
            }

            if (pdfWidth > windowDimension.width) {
              pdfWidth = windowDimension.width
            } else if (
              viewerHook.readingStyle === "facingPage" ||
              viewerHook.readingStyle === "facingPageWithTitle"
            ) {
              if (pdfWidth > windowDimension.width / 2) pdfWidth = windowDimension.width / 2
            }
            setImageSize({ height: pdfHeight, width: pdfWidth })
          }
        }}
        trustAllCerts={false}
        enablePaging={true}
        singlePage={true}
        page={renderProps.page + 1}
      />
    )
  }

  return totalPages !== undefined ? (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={totalPages}
    />
  ) : (
    <PDF
      source={source}
      style={styles.page}
      onLoadComplete={(numberOfPages) => {
        if (!totalPages) {
          setTotalPages(numberOfPages)
        }
      }}
      trustAllCerts={false}
      enablePaging={true}
    />
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
})
