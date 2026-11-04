import { Button } from "@/components"
import { findByText, fireEvent } from "@testing-library/react"
import type { Meta, StoryObj } from "@storybook/react"
import { ModalState, useModal } from "react-native-modalfy"
import { ComponentHolder } from "../../../.storybook/stories/ComponentHolder"
import type { ModalStackParams } from "./Types"

/**
 * モーダルが自分を閉じるアニメーション中に別のモーダルが開くと、
 * closeModal() が「アニメーション終了時点の最新モーダル」を消してしまう競合の再現。
 */
function CloseRaceContainer() {
  const modal = useModal<ModalStackParams>()

  return (
    <Button
      testID="modal-close-race-launch"
      onPress={() => {
        modal.openModal("ConfirmModal", {
          titleTx: "modal.deleteConfirmModal.title",
          messageTx: "modal.deleteConfirmModal.message",
          onOKPress: () => {
            modal.openModal("ErrorModal", {
              titleTx: "errors.canNotConnect",
              messageTx: "errors.canNotConnectDescription",
            })
          },
        })
      }}
    >
      {"Open"}
    </Button>
  )
}

async function playModalCloseRace({ canvasElement }: { canvasElement: HTMLElement }) {
  const launch = await findByText(canvasElement, "Open")
  fireEvent.click(launch)

  const ok = await findByText(canvasElement, "OK")
  fireEvent.click(ok)

  // 閉じるアニメーション（既定 300ms）が終わったあとも、後から開いたモーダルが残っていること
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const { currentModal, stack } = ModalState.getState<ModalStackParams>()
  const names = Array.from(stack.openedItems).map((item) => String(item.name))
  if (currentModal !== "ErrorModal") {
    throw new Error(
      `expected ErrorModal to stay open, got ${String(currentModal)} (${names.join(",")})`,
    )
  }
}

export default {
  title: "Modal Close Race",
  component: CloseRaceContainer,
  decorators: [
    (Story) => (
      <ComponentHolder>
        <Story />
      </ComponentHolder>
    ),
  ],
} as Meta<typeof CloseRaceContainer>

type StoryProps = StoryObj<typeof CloseRaceContainer>

export const CloseSelfThenOpenAnother: StoryProps = {
  play: playModalCloseRace,
}
