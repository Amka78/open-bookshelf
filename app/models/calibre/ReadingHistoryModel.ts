import { type Instance, types } from "mobx-state-tree"

export const ReadingHistoryModel = types
  .model("ReadingHistoryModel")
  .props({
    libraryId: types.string,
    bookId: types.number,
    format: types.string,
    currentPage: types.number,
    cachedPath: types.array(types.string),
    /**
     * Server-side reading position as a fraction (0–1) from Calibre.
     * Populated from `recently_read_by_user` or `last_read_positions` in the
     * book manifest.  Used to restore position when no local page history exists.
     */
    serverPosFrac: types.maybeNull(types.number),
    /** Unix epoch (seconds) of the server-side position, for recency comparison. */
    serverEpoch: types.maybeNull(types.number),
    // CBZ metadata cache for fast reload
    /** Whether this book is a comic format (CBZ, CBR, CB7, CBC, etc.) */
    isComic: types.maybeNull(types.boolean),
    /** Filename of the raster cover image (e.g., "cover.jpg") */
    rasterCoverName: types.maybeNull(types.string),
    /** Total number of images/files in the comic archive */
    totalLength: types.maybeNull(types.number),
    /** JSON-serialized file metadata map (contains size, mimetype, etc. for each file) */
    fileMetadataJson: types.maybeNull(types.string),
    /** Book hash (mtime) from manifest, used for cache invalidation */
    bookHash: types.maybeNull(types.number),
  })
  .actions((root) => ({
    setCachePath: (bookImagePathList: string[]) => {
      root.cachedPath.clear()
      root.cachedPath.push(...bookImagePathList)
    },
    setCurrentPage: (page: number) => {
      root.currentPage = page
    },
    setServerPosition: (posFrac: number, epoch: number) => {
      root.serverPosFrac = posFrac
      root.serverEpoch = epoch
    },
  }))
export type ReadingHistory = Instance<typeof ReadingHistoryModel>
