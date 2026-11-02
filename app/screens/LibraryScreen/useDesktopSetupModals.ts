import { useConvergence } from "@/hooks/useConvergence"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { useStores } from "@/models"
import { getDesktopSetupStep } from "@/utils/desktopSetup"
import { useEffect, useRef } from "react"

/**
 * デスクトップでは Library を土台にし、未接続・ライブラリ未選択の間だけ
 * ConnectModal / CalibreRootModal を自動で開く。
 */
export function useDesktopSetupModals() {
  const { calibreRootStore, settingStore } = useStores()
  const { isLarge } = useConvergence()
  const modal = useElectrobunModal()
  const initializingRef = useRef(false)

  const step = getDesktopSetupStep({
    isLarge,
    baseUrl: settingStore.api.baseUrl ?? "",
    hasSelectedLibrary: Boolean(calibreRootStore.selectedLibrary),
    libraryCount: calibreRootStore.libraryMap.size,
  })

  useEffect(() => {
    // ModalProvider は自身の useEffect で ModalState を初期化する。子の effect は
    // 親より先に走るため、直接 openModal すると "not a valid modal name" で落ちる。
    const timer = setTimeout(() => {
      if (step === "connect") {
        if (modal.currentModal !== "ConnectModal") {
          modal.openModal("ConnectModal", {})
        }
        return
      }

      if (step === "data-source") {
        if (modal.currentModal !== "CalibreRootModal") {
          modal.openModal("CalibreRootModal", {})
        }
        return
      }

      if (step !== "initialize") return
      // 接続モーダルからの initialize と二重にならないようにする
      if (modal.currentModal === "ConnectModal") return
      if (initializingRef.current) return

      initializingRef.current = true
      void calibreRootStore
        .initialize()
        .then((ok) => {
          if (!ok) {
            modal.openModal("ConnectModal", {})
          }
        })
        .finally(() => {
          initializingRef.current = false
        })
    }, 0)

    return () => clearTimeout(timer)
  }, [calibreRootStore, modal, step])
}
