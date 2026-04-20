import { GradientBackground, PageManager, ViewerHeader } from "@/components"
import { AnnotationPanel } from "@/components/AnnotationPanel"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { useStores } from "@/models"
import type { Annotation } from "@/models/calibre"
import type { ApppNavigationProp } from "@/navigators/types"
import { useAnnotations } from "@/screens/ViewerScreen/useAnnotations"
import { useViewer } from "@/screens/ViewerScreen/useViewer"
import { usePalette } from "@/theme"
import type { BookReadingStyleType } from "@/type/types"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Platform, Share, StyleSheet, View } from "react-native"
import { TextBookSpine } from "./TextBookSpine"
import {
  buildSpinePageOffsets,
  mapDisplayPageToSpineLocation,
  mapSpineLocationToDisplayPage,
  normalizeDisplayPageForReadingStyle,
} from "./pagination"

const isFacingReadingStyle = (readingStyle: BookReadingStyleType) => {
  return readingStyle === "facingPage" || readingStyle === "facingPageWithTitle"
}

type TextBookViewerProps = {
  viewerHook: ReturnType<typeof useViewer>
  getAuthHeader?: (path: string) => Record<string, string> | undefined
}

export function TextBookViewer({ getAuthHeader, viewerHook }: TextBookViewerProps) {
  const palette = usePalette()
  const navigation = useNavigation<ApppNavigationProp>()
  const modal = useElectrobunModal()
  const { settingStore } = useStores()
  const {
    annotations,
    addBookmark,
    addHighlight,
    deleteAnnotation,
    exportAnnotationsAsMarkdown,
  } = useAnnotations()
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false)
  const [currentDisplayPage, setCurrentDisplayPage] = useState(0)
  const [spinePageCounts, setSpinePageCounts] = useState<number[]>([])
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null)
  const [pendingAnchorSpineIndex, setPendingAnchorSpineIndex] = useState<number | null>(null)
  const [autoPageTurning, setAutoPageTurning] = useState(false)
  const [autoPageTurnIntervalMs, setAutoPageTurnIntervalMs] = useState(
    settingStore.autoPageTurnIntervalMs,
  )
  const spinePageCountsRef = useRef<number[]>([])

  const selectedBook = viewerHook.selectedBook
  const selectedLibrary = viewerHook.selectedLibrary
  const spinePaths: string[] = selectedBook ? Array.from(selectedBook.path) : []
  const totalSpines = spinePaths.length
  const { totalPages } = useMemo(
    () => buildSpinePageOffsets(totalSpines, spinePageCounts),
    [spinePageCounts, totalSpines],
  )
  const normalizedDisplayPage = normalizeDisplayPageForReadingStyle(
    currentDisplayPage,
    totalPages,
    viewerHook.readingStyle,
  )
  const currentLocation = useMemo(
    () => mapDisplayPageToSpineLocation(normalizedDisplayPage, totalSpines, spinePageCounts),
    [normalizedDisplayPage, spinePageCounts, totalSpines],
  )
  const currentSpineIndex = currentLocation.spineIndex
  const currentPageInSpine = currentLocation.pageInSpine
  const currentSpinePath = spinePaths[currentSpineIndex]
  const currentSpineAnnotations = annotations
    .filter((annotation) => annotation.spineIndex === currentSpineIndex)
    .map((annotation) => ({
      uuid: annotation.uuid,
      highlightedText: annotation.highlightedText ?? null,
      styleWhich: annotation.styleWhich ?? null,
    }))
  const reverse =
    viewerHook.pageDirection === "left" && viewerHook.readingStyle !== "verticalScroll"
  const facingPage = isFacingReadingStyle(viewerHook.readingStyle)
  const facingSecondPageExists =
    facingPage &&
    (viewerHook.readingStyle !== "facingPageWithTitle" || normalizedDisplayPage > 0) &&
    normalizedDisplayPage + 1 < totalPages

  useEffect(() => {
    spinePageCountsRef.current = spinePageCounts
  }, [spinePageCounts])

  useEffect(() => {
    setCurrentDisplayPage(viewerHook.initialPage)
    setSpinePageCounts([])
    setPendingAnchor(null)
    setPendingAnchorSpineIndex(null)
  }, [viewerHook.initialPage, selectedBook?.id])

  useEffect(() => {
    if (!selectedBook || totalSpines <= 0) {
      return
    }

    void viewerHook.onPageChange(currentSpineIndex)
  }, [currentSpineIndex, selectedBook, totalSpines, viewerHook])

  useEffect(() => {
    if (normalizedDisplayPage >= Math.max(totalPages - 1, 0)) {
      viewerHook.onLastPage()
    }
  }, [normalizedDisplayPage, totalPages, viewerHook])

  const navigateToDisplayPage = useCallback(
    (page: number) => {
      const nextPage = normalizeDisplayPageForReadingStyle(page, totalPages, viewerHook.readingStyle)
      setCurrentDisplayPage(nextPage)
    },
    [totalPages, viewerHook.readingStyle],
  )

  const navigateDirection = useCallback(
    (direction: "next" | "previous") => {
      if (totalPages <= 0) {
        return
      }

      let step = 1
      if (viewerHook.readingStyle === "facingPage") {
        step = 2
      } else if (viewerHook.readingStyle === "facingPageWithTitle") {
        if (direction === "next") {
          step = normalizedDisplayPage === 0 ? 1 : 2
        } else {
          step = normalizedDisplayPage <= 1 ? 1 : 2
        }
      }

      navigateToDisplayPage(normalizedDisplayPage + (direction === "next" ? step : -step))
    },
    [navigateToDisplayPage, normalizedDisplayPage, totalPages, viewerHook.readingStyle],
  )

  useEffect(() => {
    if (!autoPageTurning || totalPages <= 0 || normalizedDisplayPage >= totalPages - 1) {
      return undefined
    }

    const timeoutId = setTimeout(() => {
      navigateDirection("next")
    }, autoPageTurnIntervalMs)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [autoPageTurnIntervalMs, autoPageTurning, navigateDirection, normalizedDisplayPage, totalPages])

  const handleShowToc = useCallback(() => {
    const toc = viewerHook.toc
    if (!toc) return

    modal.openModal("TocModal", {
      toc,
      onNavigate: (dest: string) => {
        const page = viewerHook.goToTocEntry(dest)
        const [, fragment] = dest.split("#", 2)
        const displayPage = mapSpineLocationToDisplayPage(
          { spineIndex: page, pageInSpine: 0 },
          totalSpines,
          spinePageCountsRef.current,
        )
        setPendingAnchor(fragment || null)
        setPendingAnchorSpineIndex(page)
        navigateToDisplayPage(displayPage)
      },
    })
  }, [modal, navigateToDisplayPage, totalSpines, viewerHook])

  const handleShowReadingSettings = useCallback(() => {
    modal.openModal("ReadingSettingsModal", {
      autoPageTurnIntervalMs,
      onAutoPageTurnIntervalChange: (intervalMs) => {
        const normalizedIntervalMs = Math.max(100, Math.floor(intervalMs))
        settingStore.setAutoPageTurnIntervalMs(normalizedIntervalMs)
        setAutoPageTurnIntervalMs(normalizedIntervalMs)
      },
    })
  }, [autoPageTurnIntervalMs, modal, settingStore])

  const handleTextSelection = useCallback(
    (text: string) => {
      modal.openModal("AnnotationModal", {
        selectedText: text,
        onSave: async ({ text: selectedText, notes, styleWhich }) => {
          await addHighlight(currentSpineIndex, selectedText ?? text, notes || undefined, styleWhich)
        },
      })
    },
    [addHighlight, currentSpineIndex, modal],
  )

  const handleTapNavigate = useCallback(
    ({ width, x }: { x: number; y: number; width: number; height: number }) => {
      if (viewerHook.showMenu) {
        viewerHook.onManageMenu()
        return
      }

      if (!facingPage) {
        navigateDirection("next")
        return
      }

      const tappedLeftHalf = x < width / 2
      const direction =
        viewerHook.pageDirection === "left"
          ? tappedLeftHalf
            ? "next"
            : "previous"
          : tappedLeftHalf
            ? "previous"
            : "next"

      navigateDirection(direction)
    },
    [facingPage, navigateDirection, viewerHook],
  )

  const handlePaginationChange = useCallback(
    ({ currentPage, totalPages: nextSpinePageCount }: { currentPage: number; totalPages: number }) => {
      const normalizedSpinePageCount = Math.max(1, Math.floor(nextSpinePageCount))
      const previousCounts = spinePageCountsRef.current
      const previousSpinePageCount = previousCounts[currentSpineIndex]
      const nextCounts =
        previousSpinePageCount === normalizedSpinePageCount
          ? previousCounts
          : (() => {
              const updatedCounts = [...previousCounts]
              updatedCounts[currentSpineIndex] = normalizedSpinePageCount
              return updatedCounts
            })()

      if (nextCounts !== previousCounts) {
        spinePageCountsRef.current = nextCounts
        setSpinePageCounts(nextCounts)
      }

      const nextDisplayPage = mapSpineLocationToDisplayPage(
        { spineIndex: currentSpineIndex, pageInSpine: currentPage },
        totalSpines,
        nextCounts,
      )
      setCurrentDisplayPage((prev) => (prev === nextDisplayPage ? prev : nextDisplayPage))

      if (pendingAnchorSpineIndex === currentSpineIndex) {
        setPendingAnchor(null)
        setPendingAnchorSpineIndex(null)
      }
    },
    [currentSpineIndex, pendingAnchorSpineIndex, totalSpines],
  )

  const handleAnnotationJump = useCallback(
    (annotation: Annotation) => {
      setShowAnnotationPanel(false)
      const targetPage = mapSpineLocationToDisplayPage(
        { spineIndex: annotation.spineIndex, pageInSpine: 0 },
        totalSpines,
        spinePageCountsRef.current,
      )
      navigateToDisplayPage(targetPage)
    },
    [navigateToDisplayPage, totalSpines],
  )

  if (!selectedBook || !selectedLibrary || !currentSpinePath) {
    return null
  }

  return (
    <>
      <View style={styles.viewerContainer}>
        <GradientBackground
          colors={palette.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.viewerGradient}
        >
          <ViewerHeader
            title={selectedBook.metaData.title}
            visible={viewerHook.showMenu}
            autoPageTurning={autoPageTurning}
            onToggleAutoPageTurning={() => {
              setAutoPageTurning((prev) => !prev)
            }}
            onLeftArrowPress={() => {
              navigation.goBack()
            }}
            pageDirection={viewerHook.pageDirection}
            readingStyle={viewerHook.readingStyle}
            onSelectReadingStyle={(newReadingStyle) => {
              const targetPage = normalizeDisplayPageForReadingStyle(
                normalizedDisplayPage,
                totalPages,
                newReadingStyle,
              )
              viewerHook.onSetBookReadingStyle(newReadingStyle)
              setCurrentDisplayPage(targetPage)
            }}
            onSelectPageDirection={(pageDirection) => {
              viewerHook.onSetPageDirection(pageDirection)
            }}
            onAddBookmark={() => {
              modal.openModal("AnnotationModal", {
                onSave: async ({ notes }) => {
                  await addBookmark(currentSpineIndex, notes || undefined)
                },
              })
            }}
            onToggleAnnotationPanel={() => setShowAnnotationPanel((prev) => !prev)}
            onShowToc={viewerHook.toc ? handleShowToc : undefined}
            onShowReadingSettings={handleShowReadingSettings}
          />
          <View style={styles.viewerRoot}>
            <TextBookSpine
              key={currentSpinePath}
              libraryId={selectedLibrary.id}
              bookId={selectedBook.id}
              format={selectedBook.metaData.selectedFormat ?? "AZW3"}
              hash={selectedBook.hash ?? 0}
              headers={getAuthHeader?.(currentSpinePath)}
              pagePath={currentSpinePath}
              size={selectedBook.metaData.formatSizes.get(selectedBook.metaData.selectedFormat ?? "") ?? 0}
              currentPage={currentPageInSpine}
              readingStyle={viewerHook.readingStyle}
              pageDirection={viewerHook.pageDirection}
              leadingBlankPage={currentSpineIndex === 0 && viewerHook.readingStyle === "facingPageWithTitle"}
              anchor={pendingAnchorSpineIndex === currentSpineIndex ? pendingAnchor : null}
              annotations={currentSpineAnnotations}
              onPaginationChange={handlePaginationChange}
              onNavigate={handleTapNavigate}
              onLongPress={viewerHook.onManageMenu}
              onTextSelect={handleTextSelection}
            />
          </View>
          <PageManager
            currentPage={normalizedDisplayPage}
            totalPage={Math.max(totalPages, 1)}
            onPageChange={navigateToDisplayPage}
            reverse={reverse}
            facingPage={facingPage}
            facingSecondPageExists={facingSecondPageExists}
            visible={viewerHook.showMenu}
          />
        </GradientBackground>
      </View>
      {showAnnotationPanel ? (
        <View style={styles.annotationPanelOverlay}>
          <AnnotationPanel
            annotations={annotations.slice()}
            onAnnotationPress={handleAnnotationJump}
            onDeleteAnnotation={(uuid) => {
              void deleteAnnotation(uuid)
            }}
            onExport={
              Platform.OS !== "web"
                ? async () => {
                    const message = exportAnnotationsAsMarkdown(selectedBook.metaData.title)
                    await Share.share({ message })
                  }
                : undefined
            }
          />
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  annotationPanelOverlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  viewerContainer: {
    flex: 1,
  },
  viewerGradient: {
    flex: 1,
  },
  viewerRoot: {
    flex: 1,
  },
})
