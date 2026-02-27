import { VirtualLibraryButton } from "@/components/VirtualLibraryButton/VirtualLibraryButton"
import { expect } from "@storybook/jest"
import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "@storybook/testing-library"
import React from "react"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"

export default {
  title: "VirtualLibraryButton",
  component: VirtualLibraryButton,
  args: {
    virtualLibraries: ["Fiction", "Non-Fiction", "Unread", "Favorites"],
    selectedVl: null,
    onSelect: () => {},
  },
  argTypes: {
    onSelect: { action: "selected" },
  },
  parameters: {
    notes: "Virtual Library filter button. Opens a dropdown menu to select a virtual library.",
  },
  decorators: [
    (Story) => (
      <ComponentHolder alignItems="center" justifyContent="center">
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof VirtualLibraryButton>

type StoryProps = StoryObj<typeof VirtualLibraryButton>

/** デフォルト状態（未選択） */
export const Basic: StoryProps = {}

/** 仮想ライブラリが選択済みの状態 */
export const Selected: StoryProps = {
  args: {
    selectedVl: "Fiction",
  },
}

/** 仮想ライブラリが存在しない場合はボタン自体が非表示 */
export const Empty: StoryProps = {
  args: {
    virtualLibraries: [],
  },
}

/**
 * ボタンを押してメニューを開き、仮想ライブラリを選択する操作を確認する。
 * play関数でインタラクションをシミュレートする。
 */
export const SelectVirtualLibrary: StoryProps = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // ボタンをクリックしてメニューを開く
    const button = await canvas.findByTestId("virtual-library-button")
    await userEvent.click(button)

    // メニューアイテムが表示されるのを待つ
    const fictionItem = await canvas.findByTestId("vl-item-Fiction")
    expect(fictionItem).toBeTruthy()

    // 「Fiction」を選択
    await userEvent.click(fictionItem)

    // onSelectが "Fiction" で呼ばれたことを確認
    expect(args.onSelect).toHaveBeenCalledWith("Fiction")
  },
}

/**
 * 「すべて」を選択すると null が渡されることを確認する。
 */
export const SelectAll: StoryProps = {
  args: {
    selectedVl: "Fiction",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    const button = await canvas.findByTestId("virtual-library-button")
    await userEvent.click(button)

    const allItem = await canvas.findByTestId("vl-item-all")
    await userEvent.click(allItem)

    expect(args.onSelect).toHaveBeenCalledWith(null)
  },
}
