import i18n from "i18n-js"
import { useRomajiText } from "./useRomajiText"

describe("useRomajiText", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("converts kana to romaji", () => {
    jest.spyOn(i18n, "currentLocale").mockReturnValue("ja-JP")
    const { toRomajiText } = useRomajiText()

    expect(toRomajiText("やまだ たろう")).toBe("yamada tarou")
  })

  test("keeps kanji when locale is japanese", () => {
    jest.spyOn(i18n, "currentLocale").mockReturnValue("ja-JP")
    const { toRomajiText } = useRomajiText()

    expect(toRomajiText("山田 たろう")).toBe("山田 tarou")
  })

  test("transliterates kanji when locale is not japanese", () => {
    jest.spyOn(i18n, "currentLocale").mockReturnValue("en-US")
    const { toRomajiText } = useRomajiText()

    expect(toRomajiText("山田 たろう")).toBe("Shan Tian tarou")
  })

  test("builds author sort value from author list", () => {
    jest.spyOn(i18n, "currentLocale").mockReturnValue("ja-JP")
    const { toAuthorSortValue } = useRomajiText()

    expect(toAuthorSortValue(["山田 たろう", "ヤマダ ハナコ"])).toBe("山田 tarou & yamada hanako")
  })
})
