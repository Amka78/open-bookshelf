import { camelCaseToLowerCase, lowerCaseToCamelCase } from "./convert"

describe("Convert Test", () => {
  test("success lowerCaseToCamelCase", () => {
    const result = lowerCaseToCamelCase("authors_list")
    expect(result).toBe("authorsList")
  })
  test("success camelCaseToLowerCase", () => {
    const result = camelCaseToLowerCase("authorsList")

    expect(result).toBe("authors_list")
  })
})
