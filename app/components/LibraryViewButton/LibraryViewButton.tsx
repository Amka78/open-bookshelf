import { IconButton } from "@/components"

export type LibraryViewButtonProps = {
  onPress?: () => void
  mode: "viewList" | "gridView"
}

export function LibraryViewButton(props: LibraryViewButtonProps) {
  return (
    <IconButton
      iconSize="md-"
      name={props.mode === "viewList" ? "view-list" : "view-grid"}
      onPress={props.onPress}
      variant="staggerChild"
    />
  )
}
