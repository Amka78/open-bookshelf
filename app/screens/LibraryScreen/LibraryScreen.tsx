import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import {
  Box,
  Center,
  HStack,
  Icon,
  IconButton,
  Menu,
  ScrollView,
  Stagger,
  useBreakpointValue,
  useDisclose,
  VStack,
} from "native-base"
import React, { FC, useEffect, useState, useMemo } from "react"
import { useWindowDimensions } from "react-native"

import {
  BookDescriptionItem,
  BookImageItem,
  FlatList,
  LeftSideMenuItem,
  LibraryViewIcon,
  SortMenu,
} from "../../components"
import { useStores } from "../../models"
import { Library } from "../../models/CalibreRootStore"
import { ApppNavigationProp } from "../../navigators"

export type LibraryViewStyle = "gridView" | "viewList"
export const LibraryScreen: FC = observer(() => {
  const { calibreRootStore, settingStore } = useStores()
  const { isOpen, onToggle } = useDisclose()

  const [mobileViewStyle, setMovileViewStyle] = useState<LibraryViewStyle>("viewList")
  const [desktopViewStyle, setDesktopViewStyle] = useState<LibraryViewStyle>("gridView")
  const navigation = useNavigation<ApppNavigationProp>()

  const isWideScreen = useBreakpointValue({
    base: false,
    lg: true,
    xl: true,
  })

  const search = async () => {
    await calibreRootStore.searchLibrary()
  }

  useEffect(() => {
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
      },
    })
  }, [])

  const window = useWindowDimensions()

  const renderItem = ({ item }: { item: Library }) => {
    const onPress = async () => {
      await item.convertBook(() => {
        navigation.navigate("Viewer", { library: item })
      })
    }

    let listItem

    const imageUrl = `${settingStore.api.baseUrl}/get/thumb/${item.id}/config?sz=300x400`

    const itemStyle = isWideScreen ? desktopViewStyle : mobileViewStyle

    if (itemStyle === "gridView") {
      listItem = <BookImageItem source={imageUrl} onPress={onPress} />
    } else {
      listItem = (
        <BookDescriptionItem
          source={imageUrl}
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
      <FlatList<Library>
        data={selectedLibrary?.value.slice()}
        renderItem={renderItem}
        estimatedItemSize={selectedLibrary?.value.length}
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
              if (val === selectedLibrary.searchSetting.sort) {
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

  const leftSideMenu = useMemo(() => {
    return selectedLibrary.tagBrowser.map((category) => {
      return (
        <LeftSideMenuItem name={category.name} count={category.count} key={category.name}>
          {category.subCategory.map((subCategory) => {
            return (
              <LeftSideMenuItem
                mode={"subCategory"}
                count={subCategory.count}
                name={subCategory.name}
                key={subCategory.name}
                onLastNodePress={async () => {
                  selectedLibrary.searchSetting.setProp("query", subCategory.name)
                  await search()
                }}
                selected={subCategory.name === selectedLibrary.searchSetting?.query}
              >
                {subCategory.children.map((node) => {
                  return (
                    <LeftSideMenuItem
                      mode={"node"}
                      count={node.count}
                      name={node.name}
                      key={node.name}
                      onLastNodePress={async () => {
                        selectedLibrary.searchSetting.setProp("query", node.name)
                        await search()
                      }}
                      selected={node.name === selectedLibrary.searchSetting?.query}
                    />
                  )
                })}
              </LeftSideMenuItem>
            )
          })}
        </LeftSideMenuItem>
      )
    })
  }, [])

  return isWideScreen ? (
    <HStack flex="1">
      <ScrollView backgroundColor={"white"} maxWidth={"32"}>
        {leftSideMenu}
      </ScrollView>
      {LibraryCore}
    </HStack>
  ) : (
    LibraryCore
  )
})
