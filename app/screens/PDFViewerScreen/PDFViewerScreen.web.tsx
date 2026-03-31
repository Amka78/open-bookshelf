import { BookViewer, type RenderPageProps } from "@/components"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Document, Page, pdfjs } from "react-pdf"

import pdfDiagnostics from "@/services/performance/pdfDiagnostics"
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
  // PDFページのアスペクト比 (width / height)。最初のページロード時に取得する
  const [pageAspectRatio, setPageAspectRatio] = useState<number | undefined>(undefined)
  // totalPages と pageAspectRatio が両方確定するまでページ操作を無効にする
  const [pdfReady, setPdfReady] = useState(false)
  const [activePage, setActivePage] = useState(0)
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
    [calculatePageWidth, pageAspectRatio, windowDimension.height, windowDimension.width],
  )

  // 前後±2ページを非表示で事前レンダリング。ページ遷移時に再描画コストをゼロにする
  const preloadPageIndices = useMemo(() => {
    if (!pdfReady || totalPages == null) return []
    return [-2, -1, 1, 2]
      .map((offset) => activePage + offset)
      .filter((p) => p >= 0 && p < totalPages)
  }, [activePage, pdfReady, totalPages])

  // 先読みページの描画幅（単ページ幅・アスペクト比考慮）
  const preloadPageWidth = useMemo(() => {
    const maxWidth = calculatePageWidth(false, windowDimension.width)
    if (pageAspectRatio !== undefined) {
      const widthForHeight = Math.floor(windowDimension.height * pageAspectRatio)
      return Math.max(1, Math.min(maxWidth, widthForHeight))
    }
    return Math.max(1, maxWidth)
  }, [calculatePageWidth, pageAspectRatio, windowDimension.height, windowDimension.width])

  const onDocumentLoadSuccess = useCallback(
    async (pdf: {
      numPages: number
      getPage: (
        n: number,
      ) => Promise<{ getViewport: (opts: { scale: number }) => { width: number; height: number } }>
    }) => {
      // setTotalPages と setPageAspectRatio を await 後に同一マイクロタスクで呼ぶことで
      // React 18 の自動バッチングにより1回のレンダリングにまとめる。
      // これにより intermediate な状態（ページ数だけ判明してアスペクト比未定）が生じず、
      // scheduleHorizontalRecenter によるスクロール位置リセットを防ぐ。
      try {
        const firstPage = await pdf.getPage(1)
        const viewport = firstPage.getViewport({ scale: 1 })
        setTotalPages((prev) => (prev === pdf.numPages ? prev : pdf.numPages))
        setPageAspectRatio(viewport.width / viewport.height)
      } catch {
        // アスペクト比取得失敗時はページ数だけ更新してそのまま続行
        setTotalPages((prev) => (prev === pdf.numPages ? prev : pdf.numPages))
      }
      setPdfReady(true)
    },
    [setTotalPages],
  )

  if (!selectedBook) {
    return undefined
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
        onPageChange={setActivePage}
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
