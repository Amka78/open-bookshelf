import { FlatList, ListItem, RootContainer, Text } from "@/components"
import type { ModalStackParams } from "@/components/Modals/Types"
import type { LibraryMap } from "@/models/calibre"
import { View } from "react-native"
import { useModal } from "react-native-modalfy"

export type CalibreRootScreenProps = {
  onLibraryPress: (id: string) => void
  libraries: LibraryMap[]
}
export function CalibreRootScreen(props: CalibreRootScreenProps) {
  const modal = useModal<ModalStackParams>()

  const renderItem = ({ item }: { item: LibraryMap }) => {
    return (
      <ListItem
        LeftComponent={
          <View>
            <Text fontSize={"$lg"}>{item.id}</Text>
          </View>
        }
        onPress={() => props.onLibraryPress(item.id)}
      />
    )
  }

  return (
    <RootContainer>
      <FlatList<LibraryMap>
        data={props.libraries.slice()}
        renderItem={renderItem}
        estimatedItemSize={60}
      />
    </RootContainer>
  )
}
