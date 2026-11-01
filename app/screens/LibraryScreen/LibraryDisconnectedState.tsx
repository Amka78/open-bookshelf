import { Button, Heading, Text, VStack } from "@/components"
import { useConvergence } from "@/hooks/useConvergence"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import type { ApppNavigationProp } from "@/navigators/types"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

export const LibraryDisconnectedState = observer(() => {
  const { isLarge } = useConvergence()
  const modal = useElectrobunModal()
  const navigation = useNavigation<ApppNavigationProp>()

  return (
    <VStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      space="md"
      padding="$4"
      testID="library-disconnected"
    >
      <Heading tx="connectScreen.welcome" />
      <Text tx="connectScreen.detail" textAlign="center" />
      <Button
        tx="connectScreen.connect"
        onPress={() => {
          if (isLarge) {
            modal.openModal("ConnectModal", {})
            return
          }

          navigation.navigate("Connect")
        }}
      />
    </VStack>
  )
})
