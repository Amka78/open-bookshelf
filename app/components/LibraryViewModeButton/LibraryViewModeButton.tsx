import { TooltipIconButton } from "@/components"
import { translate } from "@/i18n"

type LibraryViewModeButtonProps = {
  mode: "grid" | "list"
  onToggle: () => void
}

export function LibraryViewModeButton({ mode, onToggle }: LibraryViewModeButtonProps) {
  return (
    <TooltipIconButton
      name={mode === "grid" ? "view-grid" : "view-list"}
      iconSize="md-"
      onPress={onToggle}
      tooltipTx="libraryViewMode.toggleTooltip"
    />
  )
}
