import { useStores } from "@/models"
import type { Annotation } from "@/models/calibre"
import { api } from "@/services/api"
import type { CalibreAnnotation } from "@/services/api/api.types"
import { logger } from "@/utils/logger"
import { useCallback } from "react"

function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function annotationToApi(ann: Annotation): CalibreAnnotation {
  return {
    type: ann.type,
    uuid: ann.uuid,
    spine_index: ann.spineIndex,
    spine_name: ann.spineName,
    start_cfi: ann.startCfi ?? undefined,
    end_cfi: ann.endCfi ?? undefined,
    highlighted_text: ann.highlightedText ?? undefined,
    notes: ann.notes ?? undefined,
    style:
      ann.styleKind && ann.styleWhich
        ? { kind: ann.styleKind as "color", which: ann.styleWhich }
        : undefined,
    timestamp: ann.timestamp,
    title: ann.title ?? undefined,
    pos_frac: ann.posFrac,
  }
}

export function useAnnotations() {
  const { calibreRootStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary?.selectedBook

  const addBookmark = useCallback(
    async (page: number, title?: string): Promise<boolean> => {
      if (!selectedBook || !selectedLibrary) return false
      const selectedFormat = selectedBook.metaData?.selectedFormat ?? ""
      const totalPages = selectedBook.path.length || 1
      const posFrac = totalPages > 1 ? page / (totalPages - 1) : 0
      const spineName = selectedBook.path[page] ?? ""
      const uuid = generateUuid()
      const timestamp = new Date().toISOString()

      const newAnnotation: CalibreAnnotation = {
        type: "bookmark",
        uuid,
        spine_index: page,
        spine_name: spineName,
        timestamp,
        title: title ?? `Page ${page + 1}`,
        pos_frac: posFrac,
      }

      const allAnnotations = [...selectedBook.annotations.map(annotationToApi), newAnnotation]
      const result = await api.saveAnnotations(
        selectedLibrary.id,
        selectedBook.id,
        selectedFormat,
        allAnnotations,
      )
      if (result.kind !== "ok") {
        logger.warn("Failed to save bookmark", result)
        return false
      }
      selectedBook.setAnnotations({
        highlight: allAnnotations.filter((a) => a.type === "highlight" && !a.removed),
        bookmark: allAnnotations.filter((a) => a.type === "bookmark" && !a.removed),
      })
      return true
    },
    [selectedBook, selectedLibrary],
  )

  const addHighlight = useCallback(
    async (
      page: number,
      text: string,
      notes?: string,
      styleWhich = "yellow",
    ): Promise<boolean> => {
      if (!selectedBook || !selectedLibrary) return false
      const selectedFormat = selectedBook.metaData?.selectedFormat ?? ""
      const totalPages = selectedBook.path.length || 1
      const posFrac = totalPages > 1 ? page / (totalPages - 1) : 0
      const spineName = selectedBook.path[page] ?? ""
      const uuid = generateUuid()
      const timestamp = new Date().toISOString()

      const newAnnotation: CalibreAnnotation = {
        type: "highlight",
        uuid,
        spine_index: page,
        spine_name: spineName,
        highlighted_text: text,
        notes,
        style: { kind: "color", which: styleWhich },
        timestamp,
        pos_frac: posFrac,
      }

      const allAnnotations = [...selectedBook.annotations.map(annotationToApi), newAnnotation]
      const result = await api.saveAnnotations(
        selectedLibrary.id,
        selectedBook.id,
        selectedFormat,
        allAnnotations,
      )
      if (result.kind !== "ok") {
        logger.warn("Failed to save highlight", result)
        return false
      }
      selectedBook.setAnnotations({
        highlight: allAnnotations.filter((a) => a.type === "highlight" && !a.removed),
        bookmark: allAnnotations.filter((a) => a.type === "bookmark" && !a.removed),
      })
      return true
    },
    [selectedBook, selectedLibrary],
  )

  const deleteAnnotation = useCallback(
    async (uuid: string): Promise<boolean> => {
      if (!selectedBook || !selectedLibrary) return false
      const selectedFormat = selectedBook.metaData?.selectedFormat ?? ""

      const annToDelete = selectedBook.annotations.find((a) => a.uuid === uuid)
      if (!annToDelete) return false

      const removedAnnotation: CalibreAnnotation = {
        ...annotationToApi(annToDelete),
        removed: true,
      }
      const remaining = selectedBook.annotations.filter((a) => a.uuid !== uuid).map(annotationToApi)
      const allAnnotations = [...remaining, removedAnnotation]

      const result = await api.saveAnnotations(
        selectedLibrary.id,
        selectedBook.id,
        selectedFormat,
        allAnnotations,
      )
      if (result.kind !== "ok") {
        logger.warn("Failed to delete annotation", result)
        return false
      }
      selectedBook.setAnnotations({
        highlight: remaining.filter((a) => a.type === "highlight"),
        bookmark: remaining.filter((a) => a.type === "bookmark"),
      })
      return true
    },
    [selectedBook, selectedLibrary],
  )

  const annotationsForPage = useCallback(
    (page: number) => {
      return selectedBook?.annotations.filter((a) => a.spineIndex === page) ?? []
    },
    [selectedBook],
  )

  const exportAnnotationsAsMarkdown = (bookTitle: string): string => {
    const anns = selectedBook?.annotations ?? []
    const lines = [`# Annotations: ${bookTitle}`, ""]
    for (const ann of anns) {
      if (ann.type === "bookmark") {
        lines.push("## 🔖 Bookmark")
        if (ann.notes) lines.push(`> ${ann.notes}`)
        lines.push("")
      } else {
        lines.push("## 📝 Highlight")
        if (ann.highlightedText) lines.push(`> ${ann.highlightedText}`)
        if (ann.notes) lines.push(`*${ann.notes}*`)
        lines.push("")
      }
    }
    return lines.join("\n")
  }

  return {
    annotations: selectedBook?.annotations ?? [],
    addBookmark,
    addHighlight,
    deleteAnnotation,
    annotationsForPage,
    exportAnnotationsAsMarkdown,
  }
}
