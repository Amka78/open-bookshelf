import type { ModalStackParams } from "@/components/Modals/Types"
import { useConvergence } from "@/hooks/useConvergence"
import { useEffect, useRef } from "react"
import { ModalState, useModal } from "react-native-modalfy"
import { navigationRef } from "./navigationUtilities"
import { buildModalScreenTargets } from "./responsiveModalScreens"

/**
 * 画面が小さくなったとき、開いているモーダルを対応する画面へ切り替える。
 */
export function ResponsiveModalCoordinator() {
  const modal = useModal<ModalStackParams>()
  const { isLarge } = useConvergence()
  const convertingRef = useRef(false)
  const currentModal = modal.currentModal

  useEffect(() => {
    if (isLarge || !currentModal || convertingRef.current) return
    if (!navigationRef.isReady()) return

    const openedItems = Array.from(ModalState.getState<ModalStackParams>().stack.openedItems).map(
      (item) => ({ name: String(item.name), params: item.params }),
    )
    const targets = buildModalScreenTargets(openedItems)
    if (!targets) return

    const navigateToScreen = navigationRef.navigate as unknown as (
      name: string,
      params?: object,
    ) => void

    convertingRef.current = true
    modal.closeAllModals(() => {
      for (const target of targets) {
        navigateToScreen(target.name, target.params)
      }
      convertingRef.current = false
    })
  }, [currentModal, isLarge, modal])

  return null
}
