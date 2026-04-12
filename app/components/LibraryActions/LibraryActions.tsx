import {
  AddFileButton,
  AuthButton,
  IconButton,
  LibraryViewModeButton,
  SortMenu,
  VirtualLibraryButton,
} from "@/components"
import { useStores } from "@/models"
import type { ApppNavigationProp } from "@/navigators/types"
import { useElectrobunModal } from "@/hooks/useElectrobunModal"
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
      <IconButton
        name="cog"
        iconSize="md-"
        onPress={() => {
          modal.openModal("UserPreferencesModal", {})
        }}
      />
      <IconButton
        name="progress-clock"
        iconSize="md-"
        onPress={() => {
          modal.openModal("JobQueueModal", {})
        }}
      />
      <IconButton
        name="chart-bar"
        onPress={() => {
          modal.openModal("ReadingStatsModal", {})
        }}
        iconSize="md-"
      />
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
