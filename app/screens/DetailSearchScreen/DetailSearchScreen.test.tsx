import {
  beforeEach,
  describe as baseDescribe,
  expect,
  jest,
  mock,
  test as baseTest,
} from "bun:test"
import { render } from "@testing-library/react"
import { type ReactNode } from "react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useStoresMock = jest.fn()
const useNavigationMock = jest.fn()
const useRouteMock = jest.fn()
const mockSetOptions = jest.fn()
const mockGoBack = jest.fn()
const mockOnSearch = jest.fn()

mock.module("@/models", () => ({
  useStores: useStoresMock,
}))

mock.module("@react-navigation/native", () => ({
  useNavigation: useNavigationMock,
  useRoute: useRouteMock,
}))

mock.module("@/components/Box/Box", () => ({
  Box: ({ children, testID }: { children?: ReactNode; testID?: string }) => (
    <div data-testid={testID}>{children}</div>
  ),
}))

mock.module("@/components/IconButton/IconButton", () => ({
  IconButton: ({
    onPress,
    testID,
  }: {
    onPress?: () => void
    testID?: string
  }) => (
    <button type="button" data-testid={testID} onClick={onPress}>
      Search
    </button>
  ),
}))

mock.module("@/components/LeftSideMenu/LeftSideMenu", () => {
  const CATEGORY_ALIASES: Record<string, string> = {
    author: "authors", authors: "authors",
    format: "formats", formats: "formats",
    language: "languages", languages: "languages",
    reward: "rating", rewards: "rating", rating: "rating", ratings: "rating",
    series: "series",
  }
  const normalizeCategoryKey = (key: string) => {
    const lower = key.trim().toLowerCase()
    return CATEGORY_ALIASES[lower] ?? lower
  }
  const buildItemKey = (categoryKey: string, value: string) =>
    `${normalizeCategoryKey(categoryKey)}:${value.trim().toLowerCase()}`
  const buildTagQuery = (categoryKey: string, value: string, calibreOp = "=") =>
    `${normalizeCategoryKey(categoryKey)}:${calibreOp}${value.trim()}`
  const stripWrappingQuotes = (v: string) => {
    const t = v.trim()
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
      return t.slice(1, -1).trim()
    return t
  }
  const normalizeQueryValue = (v: string) => {
    let s = v.trim()
    s = stripWrappingQuotes(s)
    s = s.replace(/^(!?[=~])/, "").trim()
    s = stripWrappingQuotes(s)
    return s.toLowerCase()
  }
  const parseTagQuery = (query: string) => {
    const q = query.trim()
    const sep = q.indexOf(":")
    if (sep <= 0) return null
    const rawCategory = q.slice(0, sep).trim()
    let rawValue = q.slice(sep + 1).trim()
    const m = rawValue.match(/\s+(and|or)\s+/i)
    if (m && m.index != null) rawValue = rawValue.slice(0, m.index).trim()
    rawValue = rawValue.replace(/^(!?[=~])/, "").trim()
    if (!rawCategory || !rawValue) return null
    return { categoryKey: rawCategory, value: rawValue }
  }
  const normalizeTagQuery = (query: string | undefined) => {
    if (!query) return null
    const p = parseTagQuery(query)
    if (!p) return null
    const cat = normalizeCategoryKey(p.categoryKey)
    const val = normalizeQueryValue(p.value)
    if (!cat || !val) return null
    return `${cat}:=${val}`
  }
  return {
    LeftSideMenu: () => <div data-testid="left-side-menu" />,
    normalizeCategoryKey,
    buildItemKey,
    buildTagQuery,
    normalizeTagQuery,
    parseTagQuery,
  }
})

let DetailSearchScreen: typeof import("./DetailSearchScreen").DetailSearchScreen

beforeEach(async () => {
  jest.clearAllMocks()

  useNavigationMock.mockReturnValue({ setOptions: mockSetOptions, goBack: mockGoBack })
  useRouteMock.mockReturnValue({
    params: { initialQuery: "authors:=Stephen King", onSearch: mockOnSearch },
  })
  useStoresMock.mockReturnValue({
    calibreRootStore: { selectedLibrary: { tagBrowser: [] } },
  })
  ;({ DetailSearchScreen } = await import("./DetailSearchScreen"))
})

describe("DetailSearchScreen", () => {
  test("renders the screen container", () => {
    const { container } = render(<DetailSearchScreen />)
    expect(container.querySelector("[data-testid='detail-search-screen']")).not.toBeNull()
  })

  test("sets headerRight via navigation options on mount", () => {
    render(<DetailSearchScreen />)
    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1]
    expect(lastCall).toBeDefined()
    expect(lastCall[0].headerRight).toBeDefined()
  })

  test("pressing the header search button calls onSearch with pendingQuery", () => {
    render(<DetailSearchScreen />)
    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1]
    const HeaderRight = lastCall[0].headerRight as () => JSX.Element
    const { container } = render(<HeaderRight />)
    const button = container.querySelector("[data-testid='detail-search-submit-button']")
    expect(button).not.toBeNull()
    ;(button as HTMLButtonElement).click()
    expect(mockOnSearch).toHaveBeenCalledWith("authors:=Stephen King")
  })

  test("pressing the header search button navigates back", () => {
    render(<DetailSearchScreen />)
    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1]
    const HeaderRight = lastCall[0].headerRight as () => JSX.Element
    const { container } = render(<HeaderRight />)
    ;(container.querySelector("button") as HTMLButtonElement).click()
    expect(mockGoBack).toHaveBeenCalledTimes(1)
  })
})
