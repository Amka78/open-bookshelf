export type DesktopSetupStep = "none" | "connect" | "initialize" | "data-source"

export function getDesktopSetupStep({
  isLarge,
  baseUrl,
  hasSelectedLibrary,
  libraryCount,
}: {
  isLarge: boolean
  baseUrl: string
  hasSelectedLibrary: boolean
  libraryCount: number
}): DesktopSetupStep {
  if (!isLarge) return "none"
  if (!baseUrl) return "connect"
  if (hasSelectedLibrary) return "none"
  if (libraryCount === 0) return "initialize"

  return "data-source"
}
