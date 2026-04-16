import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import type { MessageKey } from "@/i18n"
import { useStores } from "@/models"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react"
import { getViewerPreparationLabel, prepareViewerSession } from "./prepareViewerSession"

type ViewerRouteName = "Viewer" | "PDFViewer"
type ViewerPreparationPhase = "preparing" | "ready" | "error"

export function useViewerPreparation<RouteName extends ViewerRouteName>(routeName: RouteName) {
  void routeName
  const navigation = useNavigation<ApppNavigationProp>()
  const route = useRoute<RouteProp<AppStackParamList, RouteName>>()
  const modal = useElectrobunModal()
  const { calibreRootStore, settingStore } = useStores()
  const request = route.params?.request
  const requestKey = request ? `${request.libraryId}:${request.bookId}:${request.format}` : undefined
  const completedRequestKeyRef = useRef<string | undefined>(undefined)
  const [phase, setPhase] = useState<ViewerPreparationPhase>(request ? "preparing" : "ready")
  const [messageTx, setMessageTx] = useState<MessageKey>("viewerPreparation.preparing")

  useEffect((): void | (() => void) => {
    if (!requestKey || !request) {
      setPhase("ready")
      setMessageTx("viewerPreparation.preparing")
      return undefined
    }

    if (completedRequestKeyRef.current === requestKey) {
      setPhase("ready")
      return undefined
    }

    let cancelled = false

    setPhase("preparing")
    setMessageTx("viewerPreparation.preparing")

    prepareViewerSession({
      request,
      calibreRootStore,
      settingStore,
      onProgress: (step) => {
        if (!cancelled) {
          setMessageTx(getViewerPreparationLabel(step))
        }
      },
    })
      .then(() => {
        if (cancelled) return

        completedRequestKeyRef.current = requestKey
        setPhase("ready")
      })
      .catch((error: unknown) => {
        if (cancelled) return

        const message = error instanceof Error ? error.message : String(error)
        setPhase("error")
        modal.openModal("ErrorModal", {
          message,
          titleTx: "errors.failedConvert",
        })
        navigation.goBack()
      })

    return () => {
      cancelled = true
    }
  }, [request, requestKey, calibreRootStore, settingStore, modal, navigation])

  return {
    messageTx,
    phase,
  }
}
