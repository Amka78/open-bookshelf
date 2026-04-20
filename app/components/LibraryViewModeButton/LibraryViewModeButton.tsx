import { TooltipIconButton } from "@/components"

type LibraryViewModeButtonProps = {
  mode: "grid" | "list" | "table"
  onToggle: () => void
}

export function LibraryViewModeButton({ mode, onToggle }: LibraryViewModeButtonProps) {
  const iconName = mode === "grid" ? "view-grid" : mode === "list" ? "view-list" : "table-large"

  return (
    <TooltipIconButton
      name={iconName}
      iconSize="md-"
      onPress={onToggle}
      tooltipTx="libraryViewMode.toggleTooltip"
    />
  )
}
