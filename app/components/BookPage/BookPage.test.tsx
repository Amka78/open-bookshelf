import { beforeAll, describe as baseDescribe, test as baseTest, expect, mock } from "bun:test"
import { render } from "@testing-library/react"
import React from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

mock.module("@/components", () => ({
  Image: ({ source }: { source: unknown }) => {
    const uri =
      typeof source === "object" && source !== null && "uri" in source
        ? (source as { uri?: string }).uri
        : String(source)
    return <img src={uri} alt="page" />
  },
}))

mock.module("react-native", () => ({
  useWindowDimensions: () => ({ width: 375, height: 812 }),
}))

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

let BookPage: typeof import("./BookPage").BookPage

beforeAll(async () => {
  ;({ BookPage } = await import("./BookPage"))
})

describe("BookPage", () => {
  test("renders an image with the provided URI", () => {
    const { container } = render(
      <BookPage
        source={{ uri: "http://example.com/page1.jpg" }}
        availableWidth={375}
        availableHeight={812}
      />,
    )
    const img = container.querySelector("img")
    expect(img?.getAttribute("src")).toBe("http://example.com/page1.jpg")
  })

  test("passes the same source object to Image when re-rendered with a new object but same URI", () => {
    const capturedSources: unknown[] = []

    mock.module("@/components", () => ({
      Image: ({ source }: { source: unknown }) => {
        capturedSources.push(source)
        const uri =
          typeof source === "object" && source !== null && "uri" in source
            ? (source as { uri?: string }).uri
            : String(source)
        return <img src={uri} alt="page" />
      },
    }))

    function Wrapper({ headers }: { headers?: Record<string, string> }) {
      return (
        <BookPage
          source={{ uri: "http://example.com/page2.jpg", headers }}
          availableWidth={375}
          availableHeight={812}
        />
      )
    }

    const { rerender } = render(<Wrapper headers={{ Authorization: "Basic abc" }} />)
    const firstSource = capturedSources[capturedSources.length - 1]

    // Re-render with a new headers object but same URI
    rerender(<Wrapper headers={{ Authorization: "Basic abc" }} />)
    const secondSource = capturedSources[capturedSources.length - 1]

    // The useMemo-stabilized source must be the same object reference (no re-trigger of expo-image)
    expect(secondSource).toBe(firstSource)
  })

  test("updates source when URI changes", () => {
    const capturedSources: unknown[] = []

    mock.module("@/components", () => ({
      Image: ({ source }: { source: unknown }) => {
        capturedSources.push(source)
        const uri =
          typeof source === "object" && source !== null && "uri" in source
            ? (source as { uri?: string }).uri
            : String(source)
        return <img src={uri} alt="page" />
      },
    }))

    function Wrapper({ page }: { page: number }) {
      return (
        <BookPage
          source={{ uri: `http://example.com/page${page}.jpg` }}
          availableWidth={375}
          availableHeight={812}
        />
      )
    }

    const { rerender } = render(<Wrapper page={1} />)
    rerender(<Wrapper page={2} />)

    const lastSource = capturedSources[capturedSources.length - 1] as { uri?: string }
    expect(lastSource?.uri).toBe("http://example.com/page2.jpg")
  })
})
