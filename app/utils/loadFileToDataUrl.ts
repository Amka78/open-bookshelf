/**
 * `fileToDataUrl` は native で expo-file-system を遅延読み込みするため、
 * 呼び出し側も静的 import せずこのローダー経由にする。
 * React Compiler はコンポーネント / フック内の `import()` 式を扱えないため、
 * 式をフックの外へ出す目的も兼ねる。
 */
export function loadFileToDataUrl() {
  return import("./fileToDataUrl")
}
