import { findByText, fireEvent } from "@testing-library/react"

export async function playLeftSideMenuExpandsCategory({
  canvasElement,
  categoryName,
}: {
  canvasElement: HTMLElement
  categoryName: string
}) {
  const node = await findByText(canvasElement, categoryName)
  fireEvent.click(node)
}

export async function playLeftSideMenuNodeIsVisible({
  canvasElement,
  nodeName,
}: {
  canvasElement: HTMLElement
  nodeName: string
}) {
  await findByText(canvasElement, nodeName)
}

export async function playLeftSideMenuSelectNode({
  canvasElement,
  nodeName,
}: {
  canvasElement: HTMLElement
  nodeName: string
}) {
  const node = await findByText(canvasElement, nodeName)
  fireEvent.click(node)
}

export async function playLeftSideMenuOperatorBadgeVisible({
  canvasElement,
  operator,
}: {
  canvasElement: HTMLElement
  operator: "AND" | "OR"
}) {
  const badge = await findByText(canvasElement, operator)
  if (!badge) {
    throw new Error(`Operator badge '${operator}' should be visible.`)
  }
}

export async function playLeftSideMenuToggleOperator({
  canvasElement,
  operator,
}: {
  canvasElement: HTMLElement
  operator: "AND" | "OR"
}) {
  const badge = await findByText(canvasElement, operator)
  fireEvent.click(badge)
}

export async function playLeftSideMenuCalibreOperatorVisible({
  canvasElement,
  calibreOp,
}: {
  canvasElement: HTMLElement
  calibreOp: string
}) {
  const badge = await findByText(canvasElement, calibreOp)
  if (!badge) {
    throw new Error(`Calibre operator badge '${calibreOp}' should be visible.`)
  }
}

export async function playLeftSideMenuToggleCalibreOperator({
  canvasElement,
  calibreOp,
}: {
  canvasElement: HTMLElement
  calibreOp: string
}) {
  const badge = await findByText(canvasElement, calibreOp)
  fireEvent.click(badge)
}
