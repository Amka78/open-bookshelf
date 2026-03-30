import { BookViewer, type RenderPageProps } from "@/components"
import { PDF } from "@/library/PDF/Pdf"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useCallback, useState } from "react"
import { type FlexAlignType, StyleSheet, View, type ViewStyle } from "react-native"

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  const [sourcePageSize, setSourcePageSize] = useState<{ width: number; height: number }>()

  const {
    selectedBook,
    totalPages,
    setTotalPages,
    pdfSource,
    windowDimension,
    calculatePageDimensions,
  } = pdfHook

  // NOTE: hooks must be declared before any early return to satisfy Rules of Hooks

  // Hidden PDF (no singlePage) callback: only used to retrieve the true total page count.
  // On Android, singlePage={true} causes the native PDF renderer to load only 1 page, so
  // onLoadComplete reports numberOfPages=1. A separate hidden PDF without singlePage
  // reports the correct count and keeps the visible PDF rendering cleanly.
  const onHiddenPdfLoadComplete = useCallback(
    (numberOfPages: number) => {
      setTotalPages((prev) => Math.max(prev ?? 0, numberOfPages))
    },
    [setTotalPages],
  )

  const onPageLoadComplete = useCallback(
    (numberOfPages: number, _path: string, size: { width: number; height: number }) => {
      // Use Math.max so a subsequent onLoadComplete(1) from singlePage={true} on Android
      // can never overwrite a previously obtained correct total page count
      setTotalPages((prev) => Math.max(prev ?? 0, numberOfPages))

      setSourcePageSize((prev) => {
        if (prev && prev.width === size.width && prev.height === size.height) {
          return prev
        }

        return { height: size.height, width: size.width }
      })
    },
    [setTotalPages],
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
          scrollEnabled={false}
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

  if (!selectedBook) {
    return undefined
  }

  return (
    <View style={styles.fullscreen}>
      {/* Hidden 1×1 PDF without singlePage to obtain the real total page count.
          On Android, singlePage={true} causes onLoadComplete to report numberOfPages=1.
          This hidden component fires onLoadComplete with the correct count, which then
          wins via Math.max. It stays mounted until totalPages exceeds 1 so it can still
          fire after the visible PDF's premature onLoadComplete(1). */}
      {(totalPages === undefined || totalPages <= 1) && (
        <PDF
          source={pdfSource}
          style={styles.hiddenCountPdf}
          onLoadComplete={onHiddenPdfLoadComplete}
          trustAllCerts={false}
          page={1}
        />
      )}
      <BookViewer
        bookTitle={selectedBook.metaData.title}
        renderPage={renderPage}
        totalPage={totalPages ?? 1}
        performanceMode="pdf-single-page"
      />
    </View>
  )
})

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  page: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  hiddenCountPdf: {
    position: "absolute",
    width: 1,
    height: 1,
  },
})
