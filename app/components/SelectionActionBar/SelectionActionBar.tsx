import { HStack, IconButton, Text } from "@/components"
import { useConvergence } from "@/hooks"
import { translate } from "@/i18n"
import { usePalette } from "@/theme"

export type SelectionActionBarProps = {
  selectedCount: number
  allVisibleSelected: boolean
  onToggleVisibleSelection: () => void
  onBulkEdit: () => void
  onBulkDownload: () => void
  onBulkDelete?: () => void
  onBulkCopyAuthors?: () => void
  onBulkCopyTags?: () => void
  onBulkPasteAuthors?: () => void
  onBulkPasteTags?: () => void
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
  onBulkCopyAuthors,
  onBulkCopyTags,
  onBulkPasteAuthors,
  onBulkPasteTags,
  onClearSelection,
  toggleVisibleSelectionDisabled = false,
}: SelectionActionBarProps) {
  const palette = usePalette()
  const convergence = useConvergence()

  const toggeleText = allVisibleSelected
    ? "multiSelectBar.clearVisibleSelection"
    : "multiSelectBar.selectAllVisible"

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
          labelTx={convergence.isLarge ? toggeleText : undefined}
          onPress={onToggleVisibleSelection}
          disabled={toggleVisibleSelectionDisabled}
          testID="selection-action-bar-toggle-visible"
        />
        <IconButton
          name="book-edit"
          iconSize="md-"
          labelTx={convergence.isLarge ? "multiSelectBar.bulkEdit" : undefined}
          onPress={onBulkEdit}
          testID="selection-action-bar-bulk-edit"
        />
        <IconButton
          name="download"
          iconSize="md-"
          labelTx={convergence.isLarge ? "multiSelectBar.bulkDownload" : undefined}
          onPress={onBulkDownload}
          testID="selection-action-bar-bulk-download"
        />
        {onBulkCopyAuthors && (
          <IconButton
            name="account-multiple-check"
            iconSize="md-"
            labelTx={convergence.isLarge ? "multiSelectBar.copyAuthors" : undefined}
            onPress={onBulkCopyAuthors}
            testID="selection-action-bar-copy-authors"
          />
        )}
        {onBulkCopyTags && (
          <IconButton
            name="tag-multiple"
            iconSize="md-"
            labelTx={convergence.isLarge ? "multiSelectBar.copyTags" : undefined}
            onPress={onBulkCopyTags}
            testID="selection-action-bar-copy-tags"
          />
        )}
        {onBulkPasteAuthors && (
          <IconButton
            name="account-multiple-plus"
            iconSize="md-"
            labelTx={convergence.isLarge ? "multiSelectBar.pasteAuthors" : undefined}
            onPress={onBulkPasteAuthors}
            testID="selection-action-bar-paste-authors"
          />
        )}
        {onBulkPasteTags && (
          <IconButton
            name="tag-plus"
            iconSize="md-"
            labelTx={convergence.isLarge ? "multiSelectBar.pasteTags" : undefined}
            onPress={onBulkPasteTags}
            testID="selection-action-bar-paste-tags"
          />
        )}
        {onBulkDelete && (
          <IconButton
            name="trash-can"
            iconSize="md-"
            labelTx={convergence.isLarge ? "multiSelectBar.bulkDelete" : undefined}
            onPress={onBulkDelete}
            testID="selection-action-bar-bulk-delete"
          />
        )}
        <IconButton
          name="close"
          iconSize="md-"
          labelTx={convergence.isLarge ? "multiSelectBar.clearSelection" : undefined}
          onPress={onClearSelection}
          testID="selection-action-bar-clear"
        />
      </HStack>
    </HStack>
  )
}
