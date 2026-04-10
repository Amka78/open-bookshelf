import { BookViewer, type RenderPageProps } from "@/components"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { observer } from "mobx-react-lite"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Document, Page, pdfjs } from "react-pdf"

import pdfDiagnostics from "@/services/performance/pdfDiagnostics"
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  const { initialPage, onPageChange } = useViewer()
  // PDFページのアスペクト比 (width / height)。最初のページロード時に取得する
  const [pageAspectRatio, setPageAspectRatio] = useState<number | undefined>(undefined)
  // totalPages と pageAspectRatio が両方確定するまでページ操作を無効にする
  const [pdfReady, setPdfReady] = useState(false)
  const {
    selectedBook,
    totalPages,
    setTotalPages,
    documentFile,
    windowDimension,
    calculatePageWidth,
  } = pdfHook

  const renderPage = useCallback(
    (renderProps: RenderPageProps) => {
      const renderStartTime = performance.now()

      const availableHeight = renderProps.availableHeight ?? windowDimension.height
      const isFacingPage = renderProps.pageType !== "singlePage"
      const maxWidth = calculatePageWidth(isFacingPage, windowDimension.width)

      let pageWidth = maxWidth
      if (pageAspectRatio !== undefined) {
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
            key={`${renderProps.page}`}
            pageNumber={renderProps.page + 1}
            width={Math.max(1, pageWidth)}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            renderMode="canvas"
            devicePixelRatio={1}
            loading={null}
            onRenderSuccess={() => {
              const renderDone = performance.now()
              pdfDiagnostics.logMetric({
                pageNumber: renderProps.page + 1,
                renderStartTime,
                layoutCompleteTime: renderDone,
                totalRenderTime: renderDone - renderStartTime,
                pageType: renderProps.pageType,
                width: pageWidth,
                height: availableHeight,
              })
            }}
          />
        </View>
      )
    },
    [windowDimension.height, windowDimension.width, calculatePageWidth, pageAspectRatio],
  )

  const preloadPageIndices = useMemo(
    () =>
      !pdfReady || totalPages == null
        ? []
        : [-2, -1, 1, 2]
            .map((offset) => initialPage + offset)
            .filter((p) => p >= 0 && p < totalPages),
    [pdfReady, totalPages, initialPage],
  )

  const preloadPageWidth = useMemo(() => {
    const maxWidth = calculatePageWidth(false, windowDimension.width)
    if (pageAspectRatio !== undefined) {
      const widthForHeight = Math.floor(windowDimension.height * pageAspectRatio)
      return Math.max(1, Math.min(maxWidth, widthForHeight))
    }
    return Math.max(1, maxWidth)
  }, [calculatePageWidth, windowDimension.width, windowDimension.height, pageAspectRatio])

  const onDocumentLoadSuccess = useCallback(
    async (pdf: {
      numPages: number
      getPage: (
        n: number,
      ) => Promise<{
        getViewport: (opts: { scale: number }) => { width: number; height: number }
      }>
    }) => {
      try {
        const firstPage = await pdf.getPage(1)
        const viewport = firstPage.getViewport({ scale: 1 })
        setTotalPages((prev) => (prev === pdf.numPages ? prev : pdf.numPages))
        setPageAspectRatio(viewport.width / viewport.height)
      } catch {
        setTotalPages((prev) => (prev === pdf.numPages ? prev : pdf.numPages))
      }
      setPdfReady(true)
    },
    [setTotalPages],
  )

  if (!selectedBook) {
    return null
  }

  return (
    <Document file={documentFile} loading={null} error={null} onLoadSuccess={onDocumentLoadSuccess}>
      {/* 前後ページ先読み：画面外に保持してpdfjs側でキャンバスを事前生成させる */}
      <View style={styles.preloadContainer} pointerEvents="none" aria-hidden={true}>
        {preloadPageIndices.map((pageIdx) => (
          <Page
            key={`preload-${pageIdx}`}
            pageNumber={pageIdx + 1}
            width={preloadPageWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            renderMode="canvas"
            devicePixelRatio={1}
            loading={null}
          />
        ))}
      </View>
      <BookViewer
        bookTitle={selectedBook.metaData.title}
        renderPage={renderPage}
        totalPage={totalPages ?? 1}
        initialPage={initialPage}
        onPageChange={onPageChange}
        performanceMode="pdf-single-page"
        disableNavigation={!pdfReady}
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
    alignItems: "center",
  },
  rightPage: {
    alignItems: "center",
  },
  // 先読みページ専用コンテナ: DOM上に保持しつつ完全に非表示・クリップ
  preloadContainer: {
    position: "absolute",
    width: 0,
    height: 0,
    overflow: "hidden",
    opacity: 0,
  },
})
