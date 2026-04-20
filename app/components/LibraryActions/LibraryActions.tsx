import {
  AddFileButton,
  AuthButton,
  IconButton,
  LibraryViewModeButton,
} from "@/components"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { Menu, MenuItem, MenuItemLabel } from "@gluestack-ui/themed"
import type { DocumentPickerAsset } from "expo-document-picker"
import type React from "react"

type LibraryActionsProps = {
  viewMode: "grid" | "list" | "table"
  onToggleViewMode: () => void
  onUploadFile: (documents: DocumentPickerAsset[]) => Promise<void>
  navigation: ApppNavigationProp
}

export function LibraryActions({
  viewMode,
  onToggleViewMode,
  onUploadFile,
  navigation,
}: LibraryActionsProps) {
  const { authenticationStore } = useStores()
  const modal = useElectrobunModal()

  return (
    <>
      <Menu
        placement="bottom"
        closeOnSelect={true}
        trigger={(triggerProps) => (
          <IconButton {...triggerProps} name="cog" iconSize="md-" variant="staggerChild" />
        )}
      >
        <MenuItem
          key="user-preferences"
          textValue="user-preferences"
          onPress={() => {
            modal.openModal("UserPreferencesModal", {})
          }}
        >
          <MenuItemLabel>{translate("userPreferences.title")}</MenuItemLabel>
        </MenuItem>
        <MenuItem
          key="job-queue"
          textValue="job-queue"
          onPress={() => {
            modal.openModal("JobQueueModal", {})
          }}
      >
        <MenuItemLabel>{translate("jobQueue.title")}</MenuItemLabel>
      </MenuItem>
        <MenuItem
          key="reading-stats"
          textValue="reading-stats"
          onPress={() => {
            modal.openModal("ReadingStatsModal", {})
          }}
        >
          <MenuItemLabel>{translate("readingStats.title")}</MenuItemLabel>
        </MenuItem>
      </Menu>
      <AuthButton
        mode={authenticationStore.isAuthenticated ? "logout" : "login"}
        onLoginPress={() => {
          modal.openModal("LoginModal", {
            onLoginPress: () => {
              navigation.navigate("Connect")
            },
          })
        }}
        onLogoutPress={() => {
          authenticationStore.logout()
          navigation.navigate("Connect")
        }}
      />
      <AddFileButton
        onDocumentSelect={async (documents) => {
          await onUploadFile(documents)
        }}
      />
      <LibraryViewModeButton mode={viewMode} onToggle={onToggleViewMode} />
    </>
  )
}
