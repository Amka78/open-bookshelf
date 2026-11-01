import type { TocItem } from "@/models/calibre"

/**
 * 目次として表示する見出し（title）付きのエントリが存在するか。
 * Calibre がページ列挙だけを返す場合、エントリは dest だけで title を持たない。
 */
export function hasNamedTocEntries(toc: TocItem | null | undefined): boolean {
  if (!toc || !Array.isArray(toc.children)) return false

  return toc.children.some((child) => Boolean(child.title?.trim()) || hasNamedTocEntries(child))
}
