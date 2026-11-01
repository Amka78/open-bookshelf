import { describe, expect, test, vi } from "vitest"

import type { ModalStackParams } from "@/components/Modals/Types"
import { buildModalScreenTargets } from "./responsiveModalScreens"

describe("buildModalScreenTargets", () => {
  test("returns null when no modal is open", () => {
    expect(buildModalScreenTargets([])).toBeNull()
  })

  test("converts modals in stack order", () => {
    expect(
      buildModalScreenTargets([{ name: "ConnectModal" }, { name: "CalibreRootModal" }]),
    ).toEqual([{ name: "Connect" }, { name: "CalibreRoot" }])
  })

  test("returns null when a modal has no corresponding screen", () => {
    expect(buildModalScreenTargets([{ name: "ConnectModal" }, { name: "ConfirmModal" }])).toBeNull()
  })

  test("maps BulkEditModal params to book ids and library id", () => {
    const params = {
      books: [{ id: 1 }, { id: 2 }],
      libraryId: "library-1",
      onComplete: vi.fn(),
    } as unknown as ModalStackParams["BulkEditModal"]

    const targets = buildModalScreenTargets([{ name: "BulkEditModal", params }])
    const target = targets?.[0]

    expect(target?.name).toBe("BulkEdit")
    expect(target?.params).toEqual({
      bookIds: [1, 2],
      libraryId: "library-1",
      onComplete: params.onComplete,
    })
  })

  test("maps BookDetailModal to the screen with a link handler", () => {
    const onLinkPress = vi.fn()
    const params = {
      imageUrl: "https://example.com/cover.jpg",
      onLinkPress,
    } as ModalStackParams["BookDetailModal"]

    const targets = buildModalScreenTargets([{ name: "BookDetailModal", params }])

    expect(targets?.[0]).toEqual({
      name: "BookDetail",
      params: { imageUrl: "https://example.com/cover.jpg", onLinkPress },
    })
  })

  test("maps BookDetailModal without a link handler to a no-op handler", () => {
    const params = { imageUrl: "cover.jpg" } as ModalStackParams["BookDetailModal"]

    const targets = buildModalScreenTargets([{ name: "BookDetailModal", params }])
    const target = targets?.[0]

    expect(target?.name).toBe("BookDetail")
    if (target?.name === "BookDetail") {
      expect(target.params.onLinkPress).toBeTypeOf("function")
    }
  })
})
