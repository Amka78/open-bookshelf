import { FlatList, ListItem, Text, VStack } from "@/components"
import type { LibraryMap } from "@/models/calibre"
import { View } from "react-native"

export type CalibreRootContentProps = {
  libraries: LibraryMap[]
  onSelect: (id: string) => void
}

export function CalibreRootContent({ libraries, onSelect }: CalibreRootContentProps) {
  return (
    <VStack flex={1} testID="calibre-root-content">
      <FlatList<LibraryMap>
        data={libraries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            testID="calibre-root-item"
            LeftComponent={
              <View>
                <Text fontSize={"$lg"}>{item.id}</Text>
              </View>
            }
            onPress={() => onSelect(item.id)}
          />
        )}
      />
    </VStack>
  )
}
