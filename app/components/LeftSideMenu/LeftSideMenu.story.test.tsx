import { describe as baseDescribe, test as baseTest, expect, jest } from "bun:test"
import { render } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playLeftSideMenuCalibreOperatorVisible,
  playLeftSideMenuExpandsCategory,
  playLeftSideMenuNodeIsVisible,
  playLeftSideMenuOperatorBadgeVisible,
  playLeftSideMenuSelectNode,
  playLeftSideMenuToggleCalibreOperator,
  playLeftSideMenuToggleOperator,
} from "./leftSideMenuStoryPlay"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

describe("LeftSideMenu story play", () => {
  const renderCategoryDom = () =>
    render(
      <div>
        <button type="button">Formats</button>
        <div id="nodes" style={{ display: "none" }}>
          <button type="button">EPUB</button>
          <button type="button">PDF</button>
        </div>
      </div>,
    )

  const renderExpandedWithNodes = () =>
    render(
      <div>
        <button type="button">Formats</button>
        <button type="button">EPUB</button>
        <button type="button">PDF</button>
      </div>,
    )

  const renderWithOperatorBadge = () =>
    render(
      <div>
        <button type="button">Formats</button>
        <button type="button">EPUB</button>
        <button type="button">AND</button>
        <button type="button">PDF</button>
      </div>,
    )

  test("expands a category by clicking its name", async () => {
    const { container } = renderCategoryDom()
    await playLeftSideMenuExpandsCategory({ canvasElement: container, categoryName: "Formats" })
  })

  test("node is visible after expand", async () => {
    const { container } = renderExpandedWithNodes()
    await playLeftSideMenuNodeIsVisible({ canvasElement: container, nodeName: "EPUB" })
  })

  test("select node fires click on item", async () => {
    const onClick = jest.fn()
    const { container } = render(
      <div>
        <button type="button" onClick={onClick}>
          EPUB
        </button>
      </div>,
    )
    await playLeftSideMenuSelectNode({ canvasElement: container, nodeName: "EPUB" })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test("operator badge is visible when multiple items selected", async () => {
    const { container } = renderWithOperatorBadge()
    await playLeftSideMenuOperatorBadgeVisible({ canvasElement: container, operator: "AND" })
  })

  test("toggle operator fires click on badge", async () => {
    const onToggle = jest.fn()
    const { container } = render(
      <div>
        <button type="button" onClick={onToggle}>
          AND
        </button>
      </div>,
    )
    await playLeftSideMenuToggleOperator({ canvasElement: container, operator: "AND" })
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  test("calibre operator badge is visible", async () => {
    const { container } = render(
      <div>
        <button type="button">=</button>
      </div>,
    )
    await playLeftSideMenuCalibreOperatorVisible({ canvasElement: container, calibreOp: "=" })
  })

  test("toggle calibre operator fires click on badge", async () => {
    const onToggle = jest.fn()
    const { container } = render(
      <div>
        <button type="button" onClick={onToggle}>
          =
        </button>
      </div>,
    )
    await playLeftSideMenuToggleCalibreOperator({ canvasElement: container, calibreOp: "=" })
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  test("calibre ~ operator badge is visible after cycle", async () => {
    const { container } = render(
      <div>
        <button type="button">~</button>
      </div>,
    )
    await playLeftSideMenuCalibreOperatorVisible({ canvasElement: container, calibreOp: "~" })
  })
})
