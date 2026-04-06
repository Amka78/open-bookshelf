import { ApiCalibreInterfaceType, api } from "@/services/api"
import initializeData from "@/services/api/mock/interfacedata-update.json"
import { getSnapshot } from "mobx-state-tree"
import { CalibreRootStore } from "./CalibreRootStore"
describe("CalibreRootStore test", () => {
  beforeAll(() => {
    jest.useRealTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test("Successful execution of Initialize", () => {
    const resp = {
      kind: "ok",
      data: initializeData,
    }
    const mockInitializeCalibre = jest.spyOn(api, "initializeCalibre")
    mockInitializeCalibre.mockResolvedValue(resp as Awaited<ReturnType<typeof api.initializeCalibre>>)
    const model = CalibreRootStore.create({})

    return model.initialize().then((result) => {
      expect(result).toBeTruthy()

      expect(model.numPerPage).toBe(50)
      expect(model.defaultLibraryId).toBe("calibre")

      expect(model.readingHistories).toHaveLength(2)

      expect(model.readingHistories[0].libraryId).toBe("test1")
      expect(model.readingHistories[0].bookId).toBe(35)
      expect(model.readingHistories[0].format).toBe("CBZ")
      expect(model.readingHistories[0].currentPage).toBe(0)
      expect(model.readingHistories[0].bookId).toBe(35)
      expect(model.libraryMap.has("test1")).toBeTruthy()
      expect(model.libraryMap.has("test2")).toBeTruthy()
    })
  })
})
