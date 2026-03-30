import { HStack, IconButton, Text } from "@/components"
import { translate } from "@/i18n"
import { usePalette } from "@/theme"

export type SelectionActionBarProps = {
  selectedCount: number
  onBulkEdit: () => void
  onBulkDownload: () => void
  onClearSelection: () => void
}

export function SelectionActionBar({
  selectedCount,
  onBulkEdit,
  onBulkDownload,
  onClearSelection,
}: SelectionActionBarProps) {
  const palette = usePalette()

  return (
    <HStack
      backgroundColor={palette.surfaceStrong}
      paddingHorizontal="$3"
      paddingVertical="$2"
      justifyContent="space-between"
    >
      <Text color={palette.textPrimary}>
        {translate("multiSelectBar.selectedCount", { count: selectedCount })}
      </Text>
      <HStack space="xs">
        <IconButton
          name="book-edit"
          iconSize="md-"
          labelTx="multiSelectBar.bulkEdit"
          onPress={onBulkEdit}
          testID="selection-action-bar-bulk-edit"
        />
        <IconButton
          name="download"
          iconSize="md-"
          labelTx="multiSelectBar.bulkDownload"
          onPress={onBulkDownload}
          testID="selection-action-bar-bulk-download"
        />
        <IconButton
          name="close"
          iconSize="md-"
          labelTx="multiSelectBar.clearSelection"
          onPress={onClearSelection}
          testID="selection-action-bar-clear"
        />
      </HStack>
    </HStack>
  )
}
