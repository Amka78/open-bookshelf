import type { Category, Metadata } from "@/models/calibre"
import { renderHook } from "@testing-library/react"
import { useEditFieldSuggestions } from "./useEditFieldSuggestions"

describe("useEditFieldSuggestions", () => {
  test("builds suggestion map from tag browser", () => {
    const tagBrowser = [
      {
        category: "tags",
        subCategory: [
          {
            children: [{ name: "One" }, { name: "Two" }, { name: "" }],
          },
        ],
      },
    ] as unknown as Category[]

    const { result } = renderHook(() =>
      useEditFieldSuggestions({
        tagBrowser,
        metaData: undefined,
      }),
    )

    expect(result.current.suggestionMap).toBeDefined()
  })

  test("returns language codes from metadata", () => {
    const metaData = {
      langNames: new Map([
        ["en", "English"],
        ["ja", "Japanese"],
      ]),
    } as unknown as Metadata

    const { result } = renderHook(() =>
      useEditFieldSuggestions({
        tagBrowser: undefined,
        metaData,
      }),
    )

    expect(result.current.languageCodeSuggestions).toBeDefined()
  })
})
