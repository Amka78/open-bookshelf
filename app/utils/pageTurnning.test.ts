import { goToNextPage, goToPreviousPage } from "./pageTurnning"

describe("pageTutnning Test", () => {
  test("Successful moving forward one page", () => {
    const nextPage = goToNextPage(1, 200, 1)
    expect(nextPage).toBe(2)
  })
  test("Successful transitions for a specified number of pages.", () => {
    const nextPage = goToNextPage(1, 200, 3)
    expect(nextPage).toBe(4)
  })
  test("In the case of the final page, success is to proceed no further than that.", () => {
    const nextPage = goToNextPage(200, 200, 3)
    expect(nextPage).toBe(200)
  })
  test("Successful moving backword one page", () => {
    const nextPage = goToPreviousPage(200, 1)
    expect(nextPage).toBe(199)
  })
  test("Successful transitions for a specified number of pages.", () => {
    const nextPage = goToPreviousPage(200, 4)
    expect(nextPage).toBe(196)
  })
  test("If on the first page, do not go any further than that.", () => {
    const nextPage = goToPreviousPage(0, 1)
    expect(nextPage).toBe(0)
  })
})
