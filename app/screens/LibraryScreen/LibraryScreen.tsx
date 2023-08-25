import {
  BookDescriptionItem,
  BookImageItem,
  FlatList,
  LeftSideMenu,
  LibraryViewIcon,
  SortMenu,
} from "@/components"
import { ModalStackParams } from "@/components/Modals/Types"
import { useStores } from "@/models"
import { Library } from "@/models/CalibreRootStore"
import { ApppNavigationProp } from "@/navigators"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import {
  HStack,
  Icon,
  IconButton,
  ScrollView,
  Stagger,
  useBreakpointValue,
  useDisclose,
  VStack,
} from "native-base"
import React, { FC, useEffect, useState } from "react"
import { useWindowDimensions } from "react-native"
import { useModal } from "react-native-modalfy"

export type LibraryViewStyle = "gridView" | "viewList"
export const LibraryScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()
  const { isOpen, onToggle } = useDisclose()

  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")
  const navigation = useNavigation<ApppNavigationProp>()

  const modal = useModal<ModalStackParams>()

  const isWideScreen = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const search = async () => {
    await calibreRootStore.searchLibrary()
  }

  useEffect(() => {
    if (!calibreRootStore.selectedLibraryId) {
      navigation.navigate("Connect")
    }
    search()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: calibreRootStore.selectedLibraryId,
      headerSearchBarOptions: {
        hideWhenScrolling: true,
        onSearchButtonPress: (e) => {
          selectedLibrary.searchSetting.setProp("query", e.nativeEvent.text)
          search()
        },
        onClose: () => {
          selectedLibrary.searchSetting.setProp("query", "")
          search()
        },
      },
    })
  }, [])

  const window = useWindowDimensions()

  const renderItem = ({ item }: { item: Library }) => {
    const onItemPress = async (format: string) => {
      if (format === "PDF") {
        navigation.navigate("PDFViewer", { library: item })
      } else {
        try {
          await item.convertBook(format, () => {
            navigation.navigate("Viewer", { library: item })
          })
        } catch (e) {
          modal.openModal("ErrorModal", { message: e.message, titleTx: "errors.failedConvert" })
        }
      }
    }
    const onPress = async () => {
      if (item.metaData.formats.length > 1) {
        modal.openModal("FormatSelectModal", {
          formats: item.metaData.formats,
          onSelectFormat: async (format) => {
            await onItemPress(format)
          },
        })
      } else {
        await onItemPress(item.metaData.formats[0])
      }
    }

    let listItem

    const imageUrl = `${settingStore.api.baseUrl}/get/thumb/${item.id}/config?sz=300x400`

    const itemStyle = isWideScreen ? desktopViewStyle : mobileViewStyle

    if (itemStyle === "gridView") {
      listItem = <BookImageItem source={{ uri: imageUrl }} onPress={onPress} />
    } else {
      listItem = (
        <BookDescriptionItem
          source={{ uri: imageUrl }}
          onPress={onPress}
          authors={item.metaData.authors}
          title={item.metaData.title}
        />
      )
    }

    return listItem
  }

  const selectedLibrary = calibreRootStore.getSelectedLibrary()

  const LibraryCore = (
    <>
      {selectedLibrary ? (
        <FlatList<Library>
          data={selectedLibrary?.value.slice()}
          renderItem={renderItem}
          //estimatedItemSize={selectedLibrary?.value.length ? selectedLibrary.value.length : 0}
          numColumns={isWideScreen ? Math.floor(window.width / 242) : 1}
          onRefresh={
            isWideScreen
              ? undefined
              : async () => {
                  await search()
                }
          }
          onEndReached={async () => {
            await calibreRootStore.searchMoreLibrary()
          }}
        />
      ) : null}
      <Stagger
        visible={isOpen}
        initial={{
          opacity: 0,
          scale: 0,
          translateY: 34,
        }}
        animate={{
          translateY: 0,
          scale: 1,
          opacity: 1,
          transition: {
            type: "timing",
            mass: 0.8,
            stagger: {
              offset: 30,
              reverse: true,
            },
          },
        }}
        exit={{
          translateY: 34,
          scale: 0.5,
          opacity: 0,
          transition: {
            duration: 100,
            stagger: {
              offset: 30,
              reverse: true,
            },
          },
        }}
      >
        <VStack
          position={"absolute"}
          bottom={isWideScreen ? 10 : 5}
          right={isWideScreen ? 10 : 5}
          height={230}
        >
          <LibraryViewIcon
            mode={isWideScreen ? desktopViewStyle : mobileViewStyle}
            onPress={() => {
              if (isWideScreen) {
                setDesktopViewStyle(desktopViewStyle === "gridView" ? "viewList" : "gridView")
              } else {
                setMovileViewStyle(mobileViewStyle === "gridView" ? "viewList" : "gridView")
              }
            }}
          />
          <SortMenu
            selectedSort={selectedLibrary.searchSetting?.sort}
            selectedSortOrder={selectedLibrary.searchSetting?.sortOrder}
            field={selectedLibrary.sortField}
            onSortChange={(val) => {
              if (val === selectedLibrary.searchSetting?.sort) {
                selectedLibrary.searchSetting.setProp(
                  "sortOrder",
                  selectedLibrary.searchSetting.sortOrder === "desc" ? "asc" : "desc",
                )
              } else {
                selectedLibrary.searchSetting.setProp("sort", val)
                selectedLibrary.searchSetting.setProp("sortOrder", "desc")
              }
              search()
            }}
          />
          <IconButton
            mb="4"
            variant="solid"
            bg="teal.400"
            colorScheme="teal"
            borderRadius="full"
            icon={
              <Icon
                as={MaterialCommunityIcons}
                _dark={{
                  color: "warmGray.50",
                }}
                size="6"
                name="video"
                color="warmGray.50"
              />
            }
          />
        </VStack>
      </Stagger>
      <IconButton
        variant="solid"
        borderRadius="full"
        size="lg"
        onPress={onToggle}
        bg="cyan.400"
        position={"absolute"}
        bottom={isWideScreen ? 10 : 5}
        right={isWideScreen ? 10 : 5}
        icon={
          <Icon
            as={MaterialCommunityIcons}
            size="6"
            name="dots-horizontal"
            color="warmGray.50"
            _dark={{
              color: "warmGray.50",
            }}
          />
        }
      />
    </>
  )

  return isWideScreen ? (
    <HStack flex="1">
      <ScrollView backgroundColor={"white"} maxWidth={"32"}>
        <LeftSideMenu
          onNodePress={async (name) => {
            selectedLibrary.searchSetting.setProp("query", name)
            await search()
          }}
          tagBrowser={selectedLibrary.tagBrowser}
          selectedName={selectedLibrary.searchSetting?.query}
        />
      </ScrollView>
      {LibraryCore}
    </HStack>
  ) : (
    LibraryCore
  )
})
