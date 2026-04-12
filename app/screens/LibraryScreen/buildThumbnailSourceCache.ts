import type { Book } from "@/models/calibre"

export type ThumbnailImageSource = {
  uri: string
  headers: Record<string, string> | undefined
}

export type ThumbnailSourceCacheEntry = {
  authStateVersion: number
  source: ThumbnailImageSource
}

type BuildThumbnailSourceCacheOptions = {
  authStateVersion: number
  bookList: ReadonlyArray<Pick<Book, "id">>
  getAuthHeaders: (url: string) => Record<string, string> | undefined
  getBookThumbnailUrl: (bookId: number, libraryId: string) => string
  libraryId: string
  previousCache: ReadonlyMap<Book["id"], ThumbnailSourceCacheEntry>
}

export function buildThumbnailSourceCache({
  authStateVersion,
  bookList,
  getAuthHeaders,
  getBookThumbnailUrl,
  libraryId,
  previousCache,
}: BuildThumbnailSourceCacheOptions): Map<Book["id"], ThumbnailSourceCacheEntry> {
  const nextCache = new Map<Book["id"], ThumbnailSourceCacheEntry>()

  for (const book of bookList) {
    const uri = encodeURI(getBookThumbnailUrl(book.id, libraryId))
    const cachedSource = previousCache.get(book.id)

    if (
      cachedSource &&
      cachedSource.authStateVersion === authStateVersion &&
      cachedSource.source.uri === uri
    ) {
      nextCache.set(book.id, cachedSource)
      continue
    }

    nextCache.set(book.id, {
      authStateVersion,
      source: {
        uri,
        headers: getAuthHeaders(uri),
      },
    })
  }

  return nextCache
}
