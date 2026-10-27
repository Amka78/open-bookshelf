import { useRomajiText } from "@/hooks/useRomajiText"
import type { MetadataSnapshotIn } from "@/models/calibre"
import { type Control, type Path, useController } from "react-hook-form"

/** タイトル末尾の「タイトル 2」からシリーズ名と番号を分離する */
function toSeriesValues(value: unknown): { series: string; seriesIndex: number | null } {
  const title = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
  const match = title.match(/^(.*)\s(\d+(?:\.\d+)?)$/)

  if (match) {
    const seriesName = match[1].trim()
    const seriesIndex = Number(match[2])
    return {
      series: seriesName.length > 0 ? seriesName : "",
      seriesIndex,
    }
  }

  return {
    series: title.length > 0 ? title : "",
    seriesIndex: null,
  }
}

/**
 * ラベル横の自動設定ボタン（著者ソート / タイトルソート / シリーズ抽出）の共通ロジック。
 * BookEditField（モーダル/OCR用）と BookEditFieldNavList（EditScreen用）で共通利用する。
 */
export function useBookEditAutoActions(control: Control<MetadataSnapshotIn, unknown>) {
  const { toAuthorSortValue, toSortValue } = useRomajiText()
  const authorsController = useController({
    control,
    name: "authors" as Path<MetadataSnapshotIn>,
  })
  const authorSortController = useController({
    control,
    name: "authorSort" as Path<MetadataSnapshotIn>,
  })
  const titleController = useController({
    control,
    name: "title" as Path<MetadataSnapshotIn>,
  })
  const sortController = useController({
    control,
    name: "sort" as Path<MetadataSnapshotIn>,
  })
  const seriesController = useController({
    control,
    name: "series" as Path<MetadataSnapshotIn>,
  })
  const seriesIndexController = useController({
    control,
    name: "seriesIndex" as Path<MetadataSnapshotIn>,
  })

  const onAuthorSortAuto = () => {
    const converted = toAuthorSortValue(authorsController.field.value)
    authorSortController.field.onChange(converted)
  }

  const onTitleSortAuto = () => {
    const converted = toSortValue(titleController.field.value)
    sortController.field.onChange(converted)
  }

  const onTitleSeriesAuto = () => {
    const converted = toSeriesValues(titleController.field.value)
    seriesController.field.onChange(converted.series)
    seriesIndexController.field.onChange(converted.seriesIndex)
  }

  return {
    onAuthorSortAuto,
    onTitleSortAuto,
    onTitleSeriesAuto,
  }
}
