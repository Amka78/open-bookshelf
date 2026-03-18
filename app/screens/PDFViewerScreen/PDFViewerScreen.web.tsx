import { BookViewer, type RenderPageProps } from "@/components"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  // PDFページのアスペクト比 (width / height)。最初のページロード時に取得する
  const [pageAspectRatio, setPageAspectRatio] = useState<number | undefined>(undefined)

  const {
    selectedBook,
    totalPages,
    setTotalPages,
    documentFile,
    windowDimension,
    calculatePageWidth,
  } = pdfHook

  if (!selectedBook) {
    return undefined
  }

  const renderPage = (renderProps: RenderPageProps) => {
    const availableHeight = renderProps.availableHeight ?? windowDimension.height
    // 単一ページ・見開きどちらでも常に見開き1ページ分の幅を上限とする
    const maxWidth = calculatePageWidth(true, windowDimension.width)

    // アスペクト比が判明していれば height 制約も考慮した幅を計算する
    let pageWidth = maxWidth
    if (pageAspectRatio !== undefined) {
      // availableHeight に収まる幅 = availableHeight * (w / h)
      const widthForHeight = Math.floor(availableHeight * pageAspectRatio)
      pageWidth = Math.min(maxWidth, widthForHeight)
    }

    const pageContainerStyle =
      renderProps.pageType === "singlePage"
        ? styles.singlePage
        : renderProps.pageType === "leftPage"
          ? styles.leftPage
          : styles.rightPage

    return (
      <View style={[styles.page, pageContainerStyle]}>
        <Page
          pageNumber={renderProps.page + 1}
          width={Math.max(1, pageWidth)}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          loading={null}
          onLoadSuccess={(page) => {
            if (pageAspectRatio === undefined) {
              const viewport = page.getViewport({ scale: 1 })
              setPageAspectRatio(viewport.width / viewport.height)
            }
          }}
        />
      </View>
    )
  }

  return (
    <Document
      file={documentFile}
      loading={null}
      error={null}
      onLoadSuccess={({ numPages }) => {
        setTotalPages((prev) => {
          return prev === numPages ? prev : numPages
        })
      }}
    >
      <BookViewer
        bookTitle={selectedBook.metaData.title}
        renderPage={renderPage}
        totalPage={totalPages ?? 1}
      />
    </Document>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
  },
  singlePage: {
    alignItems: "center",
  },
  leftPage: {
    alignItems: "flex-end",
  },
  rightPage: {
    alignItems: "flex-start",
  },
})
