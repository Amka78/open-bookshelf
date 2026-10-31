import { AboutContent, RootContainer, ScrollView, VStack } from "@/components"
import { translate } from "@/i18n"
import type { ApppNavigationProp } from "@/navigators/types"
import { getAppVersion } from "@/utils/appVersion"
import { useNavigation } from "@react-navigation/native"
import { useLayoutEffect } from "react"

export function AboutScreen() {
  const navigation = useNavigation<ApppNavigationProp>()

  useLayoutEffect(() => {
    navigation.setOptions({ title: translate("about.title") ?? undefined })
  }, [navigation])

  return (
    <RootContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <VStack padding="$4">
          <AboutContent version={getAppVersion()} />
        </VStack>
      </ScrollView>
    </RootContainer>
  )
}
