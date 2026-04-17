const libraryScrollOffsetById = new Map<string, number>()

export function getLibraryScrollOffset(libraryId: string | null | undefined) {
  if (!libraryId) {
    return 0
  }

  return libraryScrollOffsetById.get(libraryId) ?? 0
}

export function setLibraryScrollOffset(libraryId: string | null | undefined, offset: number) {
  if (!libraryId) {
    return
  }

  libraryScrollOffsetById.set(libraryId, Math.max(0, offset))
}

export function clearLibraryScrollOffsets() {
  libraryScrollOffsetById.clear()
}
