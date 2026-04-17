import { HStack, IconButton, Text } from "@/components"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { translate } from "@/i18n"
import { usePalette } from "@/theme"
import { Pressable, StyleSheet, View } from "react-native"

export type BookFormatListProps = {
  formats: string[]
  onDownload: (format: string) => void
  onDelete: (format: string) => void
  onUpload: () => void
}

export function BookFormatList({ formats, onDownload, onDelete, onUpload }: BookFormatListProps) {
  const modal = useElectrobunModal()
  const palette = usePalette()

  const handleDelete = (format: string) => {
    modal.openModal("ConfirmModal", {
      titleTx: "bookFormatList.deleteTooltip",
      messageTx: "bookFormatList.deleteConfirm",
      onOKPress: () => onDelete(format),
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text tx="bookFormatList.title" style={styles.headerTitle} />
      </View>
      {formats.map((format) => (
        <HStack key={format} style={styles.row}>
          <View style={{ ...styles.badge, backgroundColor: palette.accent }}>
            <Text style={styles.badgeText}>{format.toUpperCase()}</Text>
          </View>
          <HStack style={styles.actions}>
            <IconButton
              name="download-outline"
              testID={`download-${format}`}
              onPress={() => onDownload(format)}
              accessibilityLabel={translate("bookFormatList.downloadTooltip")}
            />
            <IconButton
              name="trash-can-outline"
              testID={`delete-${format}`}
              onPress={() => handleDelete(format)}
              accessibilityLabel={translate("bookFormatList.deleteTooltip")}
            />
          </HStack>
        </HStack>
      ))}
      <Pressable
        style={styles.uploadButton}
        onPress={onUpload}
        accessibilityRole="button"
        testID="upload-format"
      >
        <HStack style={styles.uploadContent}>
          <IconButton name="plus" onPress={onUpload} pressable={false} />
          <Text style={styles.uploadText}>{translate("bookFormatList.uploadFormat")}</Text>
        </HStack>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: "100%", paddingVertical: 8 },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: { fontSize: 15, fontWeight: "600" },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  actions: { gap: 4 },
  uploadButton: { paddingHorizontal: 12, paddingVertical: 10 },
  uploadContent: { alignItems: "center", gap: 4 },
  uploadText: { fontSize: 14 },
})
