import { Instance, types } from "mobx-state-tree"

export const ReadingHistoryModel = types.model("ReadingHistoryModel").props({
  libraryId: types.string,
  bookId: types.string,
  format: types.string,
  currentPage: types.number,
})
export type ReadingHistory = Instance<typeof ReadingHistoryModel>
