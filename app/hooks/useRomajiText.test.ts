import { i18n } from "@/i18n"
import { useRomajiText } from "./useRomajiText"

describe("useRomajiText", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  function mockLocale(locale: string) {
    jest.spyOn(i18n, "locale", "get").mockReturnValue(locale)
  }

  test("converts kana to romaji", () => {
    mockLocale("ja-JP")
    const { toRomajiText } = useRomajiText()

    expect(toRomajiText("やまだ たろう")).toBe("yamada tarou")
  })

  test("keeps kanji when locale is japanese", () => {
    mockLocale("ja-JP")
    const { toRomajiText } = useRomajiText()

    expect(toRomajiText("山田 たろう")).toBe("山田 tarou")
  })

  test("transliterates kanji when locale is not japanese", () => {
    mockLocale("en-US")
    const { toRomajiText } = useRomajiText()

    expect(toRomajiText("山田 たろう")).toBe("Shan Tian tarou")
  })

  test("builds author sort value from author list", () => {
    mockLocale("ja-JP")
    const { toAuthorSortValue } = useRomajiText()

    expect(toAuthorSortValue(["山田 たろう", "ヤマダ ハナコ"])).toBe("山田 tarou & yamada hanako")
  })
})
