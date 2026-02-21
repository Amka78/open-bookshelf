import { type Instance, types } from "mobx-state-tree";

export const ReadingHistoryModel = types
  .model("ReadingHistoryModel")
  .props({
    libraryId: types.string,
    bookId: types.number,
    format: types.string,
    currentPage: types.number,
    cachedPath: types.array(types.string),
  })
  .actions((root) => ({
    setCachePath: (bookImagePathList: string[]) => {
      root.cachedPath.clear();
      root.cachedPath.push(...bookImagePathList);
    },
    setCurrentPage: (page: number) => {
      root.currentPage = page;
    },
  }));
export type ReadingHistory = Instance<typeof ReadingHistoryModel>;
