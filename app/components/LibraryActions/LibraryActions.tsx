import {
  AddFileButton,
  AuthButton,
  IconButton,
  LibraryViewModeButton,
  SortMenu,
  VirtualLibraryButton,
} from "@/components"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
import { Menu, MenuItem, MenuItemLabel, Pressable } from "@gluestack-ui/themed"
import type { DocumentPickerAsset } from "expo-document-picker"
import type React from "react"
import type { NavigationProp } from "@react-navigation/native"

type LibraryActionsProps = {
  viewMode: "grid" | "list"
  onToggleViewMode: () => void
  onSearch: (query?: string) => Promise<void>
  onSort: (sortKey: string) => void
  onSelectVirtualLibrary: (vl: string | null) => Promise<void>
  onUploadFile: (documents: DocumentPickerAsset[]) => Promise<void>
  navigation: NavigationProp<ApppNavigationProp>
  isLargeScreen: boolean
  sortField?: Array<{ id: string; name: string }>
  selectedSort?: string
  selectedSortOrder?: string
  virtualLibraries?: Array<{ name: string; path: string }>
  selectedVl?: string | null
  searchSettingVl?: string | null
}

export function LibraryActions({
  viewMode,
  onToggleViewMode,
  onSearch,
  onSort,
  onSelectVirtualLibrary,
  onUploadFile,
  navigation,
  isLargeScreen,
  sortField,
  selectedSort,
  selectedSortOrder,
  virtualLibraries,
  selectedVl,
  searchSettingVl,
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
      <VirtualLibraryButton
        virtualLibraries={virtualLibraries?.slice() ?? []}
        selectedVl={searchSettingVl ?? selectedVl}
        onSelect={(name) => {
          onSelectVirtualLibrary(name)
        }}
        isLargeScreen={isLargeScreen}
      />
      <AddFileButton
        onDocumentSelect={async (documents) => {
          await onUploadFile(documents)
        }}
      />
      <LibraryViewModeButton mode={viewMode} onToggle={onToggleViewMode} />
      <SortMenu
        selectedSort={selectedSort}
        selectedSortOrder={selectedSortOrder}
        field={sortField}
        onSortChange={(val) => {
          onSort(val)
        }}
      />
    </>
  )
}
