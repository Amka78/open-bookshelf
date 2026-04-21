import { describe, expect, test } from "bun:test"
import packageJson from "../package.json"

describe("package manager config", () => {
  test("pins canvas to a Node 25 compatible version", () => {
    expect(packageJson.overrides.canvas).toBe("3.2.0")
  })
})
