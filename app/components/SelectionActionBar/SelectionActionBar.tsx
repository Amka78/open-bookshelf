import { HStack, IconButton, Text } from "@/components"
import { translate } from "@/i18n"
import { usePalette } from "@/theme"

export type SelectionActionBarProps = {
  selectedCount: number
  allVisibleSelected: boolean
  onToggleVisibleSelection: () => void
  onBulkEdit: () => void
  onBulkDownload: () => void
  onBulkDelete?: () => void
  onClearSelection: () => void
  toggleVisibleSelectionDisabled?: boolean
}

export function SelectionActionBar({
  selectedCount,
  allVisibleSelected,
  onToggleVisibleSelection,
  onBulkEdit,
  onBulkDownload,
  onBulkDelete,
  onClearSelection,
  toggleVisibleSelectionDisabled = false,
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
          name={allVisibleSelected ? "checkbox-multiple-blank-outline" : "checkbox-multiple-marked"}
          iconSize="md-"
          labelTx={
            allVisibleSelected
              ? "multiSelectBar.clearVisibleSelection"
              : "multiSelectBar.selectAllVisible"
          }
          onPress={onToggleVisibleSelection}
          disabled={toggleVisibleSelectionDisabled}
          testID="selection-action-bar-toggle-visible"
        />
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
        {onBulkDelete && (
          <IconButton
            name="trash-can"
            iconSize="md-"
            labelTx="multiSelectBar.bulkDelete"
            onPress={onBulkDelete}
            testID="selection-action-bar-bulk-delete"
          />
        )}
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
