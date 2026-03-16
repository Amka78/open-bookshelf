import { BookViewer, type RenderPageProps } from "@/components"
import { PDF } from "@/library/PDF/Pdf"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useCallback, useState } from "react"
import { type FlexAlignType, Platform, StyleSheet, type ViewStyle } from "react-native"

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  const isAndroid = Platform.OS === "android"
  const [sourcePageSize, setSourcePageSize] = useState<{ width: number; height: number }>()

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

  const onPageLoadComplete = useCallback(
    (_numberOfPages: number, _path: string, size: { width: number; height: number }) => {
      setSourcePageSize((prev) => {
        if (prev && prev.width === size.width && prev.height === size.height) {
          return prev
        }

        return { height: size.height, width: size.width }
      })
    },
    [],
  )

  const renderPage = useCallback(
    (renderProps: RenderPageProps) => {
      let alignSelf: FlexAlignType = "center"
      const imageSize =
        sourcePageSize &&
        calculatePageDimensions(
          sourcePageSize,
          renderProps.availableWidth,
          renderProps.availableHeight ?? windowDimension.height,
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
          onLoadComplete={onPageLoadComplete}
          trustAllCerts={false}
          enablePaging={false}
          singlePage={true}
          page={renderProps.page + 1}
        />
      )
    },
    [
      calculatePageDimensions,
      onPageLoadComplete,
      pdfSource,
      sourcePageSize,
      windowDimension.height,
    ],
  )

  return totalPages !== undefined ? (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={totalPages}
      performanceMode={isAndroid ? "android-pdf" : "default"}
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
