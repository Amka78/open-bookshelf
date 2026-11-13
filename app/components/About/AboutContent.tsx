import { Button, Heading, Text, VStack } from "@/components"
import { translate } from "@/i18n"
import { usePalette } from "@/theme"
import { Linking } from "react-native"

export const ABOUT_AUTHOR = "Amemiya Hikaru (Amka78)"
export const ABOUT_REPOSITORY_URL = "https://github.com/Amka78/shoin"
export const ABOUT_ISSUES_URL = `${ABOUT_REPOSITORY_URL}/issues`
export const ABOUT_LICENSE_URL = `${ABOUT_REPOSITORY_URL}/blob/main/LICENSE`

export type AboutContentProps = {
  version?: string
}

function openLink(url: string) {
  void Linking.openURL(url).catch(() => {})
}

export function AboutContent({ version }: AboutContentProps) {
  const palette = usePalette()
  const displayVersion = version ?? translate("about.unknownVersion")

  return (
    <VStack space="lg" testID="about-content">
      <VStack space="xs">
        <Heading size="lg">Shoin</Heading>
        <Text testID="about-version" color={palette.textSecondary} fontSize="$sm">
          {translate("about.version", { version: displayVersion })}
        </Text>
      </VStack>

      <VStack space="xs">
        <Text fontWeight="$bold" tx="about.author" />
        <Text>{ABOUT_AUTHOR}</Text>
      </VStack>

      <VStack space="xs">
        <Text fontWeight="$bold" tx="about.contact" />
        <Text color={palette.textSecondary} fontSize="$sm" tx="about.contactHint" />
        <Button
          variant="link"
          testID="about-contact-link"
          justifyContent="flex-start"
          onPress={() => openLink(ABOUT_ISSUES_URL)}
        >
          {ABOUT_ISSUES_URL}
        </Button>
      </VStack>

      <VStack space="xs">
        <Text fontWeight="$bold" tx="about.license" />
        <Text fontSize="$sm" tx="about.licenseSummary" />
        <Text color={palette.textSecondary} fontSize="$sm" tx="about.commercialUse" />
        <Button
          variant="link"
          testID="about-license-link"
          justifyContent="flex-start"
          onPress={() => openLink(ABOUT_LICENSE_URL)}
        >
          {translate("about.viewLicense")}
        </Button>
      </VStack>

      <VStack space="xs">
        <Text fontWeight="$bold" tx="about.repository" />
        <Button
          variant="link"
          testID="about-repository-link"
          justifyContent="flex-start"
          onPress={() => openLink(ABOUT_REPOSITORY_URL)}
        >
          {ABOUT_REPOSITORY_URL}
        </Button>
      </VStack>
    </VStack>
  )
}
