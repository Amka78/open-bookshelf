import { BookViewer, type RenderPageProps } from "@/components"
import { usePDFViewer } from "@/screens/PDFViewerScreen/usePDFViewer"
import { observer } from "mobx-react-lite"
import React from "react"
import { StyleSheet, View } from "react-native"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export const PDFViewerScreen = observer(() => {
  const pdfHook = usePDFViewer()

  const {
    selectedBook,
    totalPages,
    documentFile,
    windowDimension,
    calculatePageWidth,
  } = pdfHook

  if (!selectedBook) {
    return undefined
  }

  const renderPage = (renderProps: RenderPageProps) => {
    const isFacingPage = renderProps.pageType !== "singlePage"
    const pageWidth = calculatePageWidth(isFacingPage, windowDimension.width)

    return (
      <View style={styles.page}>
        <Document
          file={documentFile}
          loading={null}
          error={null}
          onLoadSuccess={({ numPages }) => {
            if (!totalPages) {
              pdfHook.setTotalPages(numPages)
            }
          }}
        >
          <Page
            pageNumber={renderProps.page + 1}
            width={pageWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading={null}
          />
        </Document>
      </View>
    )
  }

  return (
    <BookViewer
      bookTitle={selectedBook.metaData.title}
      renderPage={renderPage}
      totalPage={totalPages ?? 1}
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
