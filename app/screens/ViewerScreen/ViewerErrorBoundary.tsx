import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { ErrorDetails } from "@/screens/ErrorScreen/ErrorDetails"
import { navigateToConnect, resetAppToConnect } from "@/screens/ErrorScreen/resetApp"
import { usePalette } from "@/theme"
import React, { Component, type ErrorInfo, type ReactNode, useEffect, useRef } from "react"
import { View } from "react-native"

type ViewerErrorBoundaryProps = {
  children: ReactNode
  onBackToLibrary: () => void
}

type ViewerErrorBoundaryState = {
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
}

/**
 * Viewer / PDFViewer の予期しない描画エラーを受け止める。
 * まずライブラリへ戻るか確認し、拒否された場合だけエラー画面を表示する。
 */
export class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  ViewerErrorBoundaryState
> {
  state: ViewerErrorBoundaryState = { error: null, errorInfo: null, showDetails: false }

  static getDerivedStateFromError(error: Error): Partial<ViewerErrorBoundaryState> {
    return { error, showDetails: false }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
  }

  showErrorDetails = () => {
    this.setState({ showDetails: true })
  }

  render() {
    const { error } = this.state

    if (!error) {
      return this.props.children
    }

    if (!this.state.showDetails) {
      return (
        <ViewerErrorPrompt
          onBackToLibrary={this.props.onBackToLibrary}
          onShowDetails={this.showErrorDetails}
        />
      )
    }

    return (
      <ErrorDetails
        error={error}
        errorInfo={this.state.errorInfo ?? { componentStack: "" }}
        onReset={() => {
          void resetAppToConnect()
        }}
        onGoToConnect={() => {
          void navigateToConnect()
        }}
      />
    )
  }
}

type ViewerErrorPromptProps = {
  onBackToLibrary: () => void
  onShowDetails: () => void
}

function ViewerErrorPrompt({ onBackToLibrary, onShowDetails }: ViewerErrorPromptProps) {
  const modal = useElectrobunModal()
  const palette = usePalette()
  const openedRef = useRef(false)

  useEffect(() => {
    if (openedRef.current) return

    openedRef.current = true
    modal.openModal("ConfirmModal", {
      titleTx: "errorScreen.title",
      messageTx: "errorScreen.viewerErrorPrompt",
      okTx: "errorScreen.backToLibrary",
      cancelTx: "errorScreen.showErrorDetails",
      onOKPress: onBackToLibrary,
      onCancelPress: onShowDetails,
      onDismiss: onShowDetails,
    })
  }, [modal, onBackToLibrary, onShowDetails])

  return <View style={{ backgroundColor: palette.bg0, flex: 1 }} />
}
