import { BookViewer, RenderPageProps } from "@/components"
import { useViewer } from "@/hooks/useViewer"
import { useStores } from "@/models"
import { AppStackParamList } from "@/navigators"
import { RouteProp, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { StyleSheet, useWindowDimensions } from "react-native"
import * as PDF from "@/components/PDF/Pdf"

type PDFViewerScreenRouteProp = RouteProp<AppStackParamList, "Viewer">

export const PDFViewerScreen = observer(() => {
  const { settingStore } = useStores()
  const route = useRoute<PDFViewerScreenRouteProp>()

  const [totalPages, setTotalPages] = useState(undefined)
  const [imageSize, setImageSize] = useState(undefined)

  const windowDimension = useWindowDimensions()

  const source = {
    uri: `${settingStore.api.baseUrl}/get/PDF/${route.params.library.id}/config?content_disposition=inline`,
    cache: true,
  }

  const viewerHook = useViewer()

  const renderPage = (renderProps: RenderPageProps) => {
    let alignSelf = "center"

    if (renderProps.pageType === "leftPage") {
      alignSelf = "flex-end"
    } else if (renderProps.pageType === "rightPage") {
      alignSelf = "flex-start"
    }
    return (
      <PDF
        source={source}
        style={[styles.page, { alignSelf, justifyContent: "center" }, imageSize]}
        onLoadComplete={(numberOfPages, path, size) => {
          if (!imageSize) {
            let pdfHeight = size.height
            let pdfWidth = size.width

            if (size.height > windowDimension.height) {
              pdfWidth = pdfWidth * (windowDimension.height / size.height)
              pdfHeight = windowDimension.height
            }

            if (pdfWidth > windowDimension.width) {
              pdfWidth = windowDimension.width
            } else if (
              viewerHook.readingStyle === "facingPage" ||
              viewerHook.readingStyle === "facingPageWithTitle"
            ) {
              if (pdfWidth > windowDimension.width / 2) pdfWidth = windowDimension.width / 2
            }
            setImageSize({ height: pdfHeight, width: pdfWidth })
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
      bookTitle={route.params.library.metaData.title}
      renderPage={renderPage}
      totalPage={totalPages}
    />
  ) : (
    <PDF
      source={source}
      style={styles.page}
      onLoadComplete={(numberOfPages) => {
        if (!totalPages) {
          setTotalPages(numberOfPages)
        }
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
