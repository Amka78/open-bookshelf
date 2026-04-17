import {
  beforeAll,
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  test as baseTest,
} from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let clearLibraryScrollOffsets: typeof import("./libraryScrollState").clearLibraryScrollOffsets
let useLibraryScrollPosition: typeof import("./useLibraryScrollPosition").useLibraryScrollPosition

describe("useLibraryScrollPosition", () => {
  beforeAll(async () => {
    ;({ clearLibraryScrollOffsets } = await import("./libraryScrollState"))
    ;({ useLibraryScrollPosition } = await import("./useLibraryScrollPosition"))
  })

  beforeEach(() => {
    clearLibraryScrollOffsets()
  })

  test("restores the last saved offset when the library screen mounts again", () => {
    const initialRestore = jest.fn()
    const initialHook = renderHook(() =>
      useLibraryScrollPosition({
        libraryId: "library-1",
        isFocused: true,
        onRestoreOffset: initialRestore,
      }),
    )

    act(() => {
      initialHook.result.current.rememberScrollOffset(320)
    })
    initialHook.unmount()

    const restoreOffset = jest.fn()
    const restoredHook = renderHook(() =>
      useLibraryScrollPosition({
        libraryId: "library-1",
        isFocused: true,
        onRestoreOffset: restoreOffset,
      }),
    )

    act(() => {
      restoredHook.result.current.restoreScrollOffset()
    })

    expect(initialRestore).not.toHaveBeenCalled()
    expect(restoreOffset).toHaveBeenCalledWith(320)
  })

  test("keeps saved offsets scoped to each library", () => {
    const firstHook = renderHook(() =>
      useLibraryScrollPosition({
        libraryId: "library-1",
        isFocused: true,
        onRestoreOffset: jest.fn(),
      }),
    )
    const secondHook = renderHook(() =>
      useLibraryScrollPosition({
        libraryId: "library-2",
        isFocused: true,
        onRestoreOffset: jest.fn(),
      }),
    )

    act(() => {
      firstHook.result.current.rememberScrollOffset(120)
      secondHook.result.current.rememberScrollOffset(480)
    })

    firstHook.unmount()
    secondHook.unmount()

    const firstRestore = jest.fn()
    const secondRestore = jest.fn()
    const firstRestoredHook = renderHook(() =>
      useLibraryScrollPosition({
        libraryId: "library-1",
        isFocused: true,
        onRestoreOffset: firstRestore,
      }),
    )
    const secondRestoredHook = renderHook(() =>
      useLibraryScrollPosition({
        libraryId: "library-2",
        isFocused: true,
        onRestoreOffset: secondRestore,
      }),
    )

    act(() => {
      firstRestoredHook.result.current.restoreScrollOffset()
      secondRestoredHook.result.current.restoreScrollOffset()
    })

    expect(firstRestore).toHaveBeenCalledWith(120)
    expect(secondRestore).toHaveBeenCalledWith(480)
  })

  test("restores only once until the screen is focused again", () => {
    const initialHook = renderHook(() =>
      useLibraryScrollPosition({
        libraryId: "library-1",
        isFocused: true,
        onRestoreOffset: jest.fn(),
      }),
    )

    act(() => {
      initialHook.result.current.rememberScrollOffset(240)
    })
    initialHook.unmount()

    const restoreOffset = jest.fn()
    const { result, rerender } = renderHook(
      ({ isFocused }) =>
        useLibraryScrollPosition({
          libraryId: "library-1",
          isFocused,
          onRestoreOffset: restoreOffset,
        }),
      { initialProps: { isFocused: true } },
    )

    act(() => {
      result.current.restoreScrollOffset()
      result.current.restoreScrollOffset()
    })

    expect(restoreOffset).toHaveBeenCalledTimes(1)

    rerender({ isFocused: false })
    rerender({ isFocused: true })

    act(() => {
      result.current.restoreScrollOffset()
    })

    expect(restoreOffset).toHaveBeenCalledTimes(2)
  })
})
