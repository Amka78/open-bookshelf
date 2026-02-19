import { BookViewer, type RenderPageProps } from "@/components"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import React, { useMemo, useState } from "react"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export const PDFViewerScreen = observer(() => {
  const { authenticationStore, calibreRootStore, settingStore } = useStores()

  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)
  const selectedBook = calibreRootStore.selectedLibrary.selectedBook

  const windowDimension = useWindowDimensions()

  let header: Record<string, string> | undefined

  if (authenticationStore.isAuthenticated) {
    header = { Authorization: `Basic ${authenticationStore.token}` }
  }
  const sourceUri = `${settingStore.api.baseUrl}/get/PDF/${selectedBook.id}/config?content_disposition=inline`

  const documentFile = useMemo(
    () => ({
      url: sourceUri,
      httpHeaders: header,
      withCredentials: false,
    }),
    [header, sourceUri],
  )

  const renderPage = (renderProps: RenderPageProps) => {
    const isFacingPage = renderProps.pageType !== "singlePage"
    const pageWidth = isFacingPage
      ? Math.max(Math.floor(windowDimension.width / 2) - 24, 1)
      : Math.max(Math.floor(windowDimension.width) - 32, 1)

    return (
      <View style={styles.page}>
        <Document
          file={documentFile}
          loading={null}
          error={null}
          onLoadSuccess={({ numPages }) => {
            setTotalPages((prev) => prev ?? numPages)
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
