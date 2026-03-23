import { BookViewer, type RenderPageProps } from "@/components"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React, { useCallback, useState } from "react"
import { StyleSheet, View } from "react-native"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()
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
          />
        </View>
      )
    },
    [pageAspectRatio, windowDimension.height, windowDimension.width, calculatePageWidth],
  )

  if (!selectedBook) {
    return undefined
  }

  return (
    <Document
      file={documentFile}
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
