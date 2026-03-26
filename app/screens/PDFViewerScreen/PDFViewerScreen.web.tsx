import { BookViewer, type RenderPageProps } from "@/components"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useMemo, useState } from "react"
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
  const [webPdfBuffer, setWebPdfBuffer] = useState<ArrayBuffer | undefined>(undefined)
  const [webPdfFetchFailed, setWebPdfFetchFailed] = useState(false)
  const [activePage, setActivePage] = useState(0)
  const [isPageSettling, setIsPageSettling] = useState(false)

  const pageRenderCountRef = React.useRef(0)
  const pageSettleTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const {
    selectedBook,
    totalPages,
    setTotalPages,
    sourceUri,
    header,
    documentFile,
    windowDimension,
    calculatePageWidth,
  } = pdfHook

  useEffect(() => {
    let cancelled = false

    const loadPdfBinary = async () => {
      if (!sourceUri) {
        setWebPdfBuffer(undefined)
        return
      }

      try {
        setPdfReady(false)
        setWebPdfFetchFailed(false)
        const response = await fetch(sourceUri, {
          headers: header,
          credentials: "omit",
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`)
        }

        const data = await response.arrayBuffer()
        if (!cancelled) {
          setWebPdfBuffer(data)
        }
      } catch (error) {
        if (!cancelled) {
          setWebPdfBuffer(undefined)
          setWebPdfFetchFailed(true)
          console.warn("[PDF] Binary preload failed, fallback to URL mode", error)
        }
      }
    }

    loadPdfBinary()
    return () => {
      cancelled = true
    }
  }, [header, sourceUri])

  useEffect(() => {
    void activePage
    setIsPageSettling(true)

    if (pageSettleTimerRef.current) {
      clearTimeout(pageSettleTimerRef.current)
    }

    pageSettleTimerRef.current = setTimeout(() => {
      setIsPageSettling(false)
    }, 260)

    return () => {
      if (pageSettleTimerRef.current) {
        clearTimeout(pageSettleTimerRef.current)
      }
    }
  }, [activePage])

  const documentSource = useMemo(() => {
    if (webPdfBuffer && !webPdfFetchFailed) {
      return { data: webPdfBuffer }
    }
    return documentFile
  }, [documentFile, webPdfBuffer, webPdfFetchFailed])

  const renderQuality = isPageSettling ? "fast" : "high"
  const pdfDevicePixelRatio = renderQuality === "fast" ? 0.7 : 1

  const renderPage = useCallback(
    (renderProps: RenderPageProps) => {
      const renderStartTime = performance.now()
      pageRenderCountRef.current++

      const availableHeight = renderProps.availableHeight ?? windowDimension.height
      const maxWidth = calculatePageWidth(true, windowDimension.width)

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
            key={`${renderProps.page}-${renderQuality}`}
            pageNumber={renderProps.page + 1}
            width={Math.max(1, pageWidth)}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            renderMode="canvas"
            devicePixelRatio={pdfDevicePixelRatio}
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
    [
      calculatePageWidth,
      pageAspectRatio,
      pdfDevicePixelRatio,
      renderQuality,
      windowDimension.height,
      windowDimension.width,
    ],
  )

  if (!selectedBook) {
    return undefined
  }

  return (
    <Document
      file={documentSource}
      loading={null}
      error={null}
      onLoadSuccess={async (pdf) => {
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
      }}
    >
      <BookViewer
        bookTitle={selectedBook.metaData.title}
        renderPage={renderPage}
        totalPage={totalPages ?? 1}
        onPageChange={setActivePage}
        performanceMode="web-pdf"
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
    alignItems: "flex-end",
  },
  rightPage: {
    alignItems: "flex-start",
  },
})
