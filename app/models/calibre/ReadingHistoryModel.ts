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
