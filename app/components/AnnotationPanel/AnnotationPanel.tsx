import { Text } from "@/components/Text/Text"
import type { Annotation } from "@/models/calibre"
import React from "react"
import { FlatList, Pressable, StyleSheet, View } from "react-native"

type Props = {
  annotations: Annotation[]
  onAnnotationPress: (annotation: Annotation) => void
  onDeleteAnnotation: (uuid: string) => void
  onExport?: () => void
}

const COLOR_MAP: Record<string, string> = {
  yellow: "#FFDC00",
  green: "#64DC64",
  blue: "#64B4FF",
  pink: "#FF96B4",
  purple: "#C882FF",
}

export function AnnotationPanel({
  annotations,
  onAnnotationPress,
  onDeleteAnnotation,
  onExport,
}: Props) {
  const header = (
    <View style={styles.header}>
      <Text tx="annotationPanel.title" style={styles.headerTitle} />
      {onExport != null && (
        <Pressable onPress={onExport} style={styles.exportBtn} accessibilityRole="button">
          <Text tx="annotationPanel.export" style={styles.exportBtnText} />
        </Pressable>
      )}
    </View>
  )

  if (annotations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {header}
        <View style={styles.empty}>
          <Text tx="annotationPanel.empty" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {header}
      <FlatList
        data={annotations.slice().sort((a, b) => a.spineIndex - b.spineIndex)}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => onAnnotationPress(item)}>
            <View style={styles.itemHeader}>
              {item.type === "highlight" && (
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: COLOR_MAP[item.styleWhich ?? "yellow"] ?? COLOR_MAP.yellow,
                    },
                  ]}
                />
              )}
              {item.type === "bookmark" && <Text style={styles.bookmarkIcon}>🔖</Text>}
              <Text style={styles.pageLabel}>P.{item.spineIndex + 1}</Text>
              <Pressable onPress={() => onDeleteAnnotation(item.uuid)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </Pressable>
            </View>
            {item.highlightedText ? (
              <Text style={styles.highlightText} numberOfLines={2}>
                "{item.highlightedText}"
              </Text>
            ) : null}
            {item.title ? (
              <Text style={styles.noteText} numberOfLines={1}>
                {item.title}
              </Text>
            ) : null}
            {item.notes ? (
              <Text style={styles.noteText} numberOfLines={2}>
                {item.notes}
              </Text>
            ) : null}
          </Pressable>
        )}
        style={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: { fontSize: 15, fontWeight: "600" },
  exportBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  exportBtnText: { fontSize: 13, color: "#3B82F6" },
  list: { flex: 1 },
  empty: { padding: 16, alignItems: "center" },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  itemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  bookmarkIcon: { fontSize: 14, marginRight: 6 },
  pageLabel: { flex: 1, fontSize: 12, color: "#666" },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 12, color: "#999" },
  highlightText: { fontStyle: "italic", fontSize: 13, color: "#333" },
  noteText: { fontSize: 13, color: "#555", marginTop: 2 },
})
