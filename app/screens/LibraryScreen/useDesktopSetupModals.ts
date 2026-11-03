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
  // 画面側からの自動 initialize は、起動時点で接続先が保存されている場合だけ行う。
  // ConnectModal からの初回接続まで自動化すると、401 のたびに initialize と
  // LoginModal の表示が繰り返されてモーダルが積み上がる。
  const autoInitializeAllowedRef = useRef(Boolean(settingStore.api.baseUrl))
  const autoInitializedRef = useRef(false)

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
      // モーダルが開いている間は自動初期化しない。認証待ちの LoginModal や
      // ConnectModal の裏で initialize を再実行するとモーダルが競合する。
      if (modal.currentModal) return
      if (!autoInitializeAllowedRef.current || autoInitializedRef.current) return
      if (initializingRef.current) return

      // 失敗時に ConnectModal を開き直さない。失敗の種類に応じたモーダルは
      // CalibreRootStore.initialize -> handleCommonApiError が開き、閉じた後は
      // LibraryDisconnectedState から再接続できる。
      autoInitializedRef.current = true
      initializingRef.current = true
      void calibreRootStore.initialize().finally(() => {
        initializingRef.current = false
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [calibreRootStore, modal, step])
}
