import { localizeTestRegistrar } from "@/test/test-name-i18n"

describe("alias smoke: @/test/", () => {
  it("resolves @/test/test-name-i18n through the alias", () => {
    expect(localizeTestRegistrar("ok")).toBe("ok")
  })
})
