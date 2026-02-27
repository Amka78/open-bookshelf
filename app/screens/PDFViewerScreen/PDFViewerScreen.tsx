import { BookViewer, type RenderPageProps } from "@/components"
import { PDF } from "@/library/PDF/Pdf"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { useViewer } from "../ViewerScreen/useViewer"

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  const viewerHook = useViewer()
  const [imageSize, setImageSize] = useState(undefined)

  const {
    selectedBook,
    totalPages,
    setTotalPages,
    pdfSource,
    windowDimension,
    calculatePageDimensions,
  } = pdfHook

  if (!selectedBook) {
    return undefined
  }

  const renderPage = (renderProps: RenderPageProps) => {
    let alignSelf = "center"

    if (renderProps.pageType === "leftPage") {
      alignSelf = "flex-end"
    } else if (renderProps.pageType === "rightPage") {
      alignSelf = "flex-start"
    }
    return (
      <PDF
        source={pdfSource}
        style={[styles.page, { alignSelf, justifyContent: "center" }, imageSize]}
        onLoadComplete={(numberOfPages, path, size) => {
          if (!imageSize) {
            const isFacingPage =
              viewerHook.readingStyle === "facingPage" ||
              viewerHook.readingStyle === "facingPageWithTitle"
            const dimensions = calculatePageDimensions(
              size,
              windowDimension.width,
              windowDimension.height,
              isFacingPage,
            )
            setImageSize({ height: dimensions.height, width: dimensions.width })
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
      source={pdfSource}
      style={styles.page}
      onLoadComplete={(numberOfPages) => {
        setTotalPages(numberOfPages)
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
