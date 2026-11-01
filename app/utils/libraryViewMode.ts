export type LibraryViewMode = "grid" | "list" | "table"

/**
 * 画面サイズが Table モードを許可しない場合は list にフォールバックする。
 */
export function normalizeLibraryViewMode(
  mode: LibraryViewMode,
  canUseTableMode: boolean,
): LibraryViewMode {
  return mode === "table" && !canUseTableMode ? "list" : mode
}

/**
 * 表示モードの切り替え順。Table モードが使えない場合は grid と list だけを循環する。
 */
export function getNextLibraryViewMode(
  mode: LibraryViewMode,
  canUseTableMode: boolean,
): LibraryViewMode {
  if (mode === "grid") return "list"
  if (mode === "list") return canUseTableMode ? "table" : "grid"

  return "grid"
}
