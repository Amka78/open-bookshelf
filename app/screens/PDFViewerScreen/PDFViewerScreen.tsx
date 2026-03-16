import { BookViewer, type RenderPageProps } from "@/components"
import { PDF } from "@/library/PDF/Pdf"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { type FlexAlignType, StyleSheet, type ViewStyle } from "react-native"

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  const [sourcePageSize, setSourcePageSize] = useState<{ width: number; height: number }>()

  const { selectedBook, totalPages, setTotalPages, pdfSource, calculatePageDimensions } = pdfHook

  if (!selectedBook) {
    return undefined
  }

  const renderPage = (renderProps: RenderPageProps) => {
    let alignSelf: FlexAlignType = "center"
    const imageSize =
      sourcePageSize &&
      calculatePageDimensions(
        sourcePageSize,
        renderProps.availableWidth,
        renderProps.availableHeight,
        false,
      )

    if (renderProps.pageType === "leftPage") {
      alignSelf = "flex-end"
    } else if (renderProps.pageType === "rightPage") {
      alignSelf = "flex-start"
    }

    const pageAlignStyle: ViewStyle = {
      alignSelf,
      justifyContent: "center",
    }

    return (
      <PDF
        source={pdfSource}
        style={[styles.page, pageAlignStyle, imageSize]}
        onLoadComplete={(numberOfPages, path, size) => {
          if (
            !sourcePageSize ||
            sourcePageSize.width !== size.width ||
            sourcePageSize.height !== size.height
          ) {
            setSourcePageSize({ height: size.height, width: size.width })
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
