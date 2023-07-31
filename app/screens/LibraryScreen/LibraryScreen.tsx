import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import {
  Icon,
  IconButton,
  Stagger,
  useBreakpointValue,
  useDisclose,
  VStack,
  Menu,
} from "native-base"
import React, { FC, useEffect, useState } from "react"
import { useWindowDimensions } from "react-native"

import { BookDescriptionItem, BookImageItem, FlatList, LibraryViewIcon } from "../../components"
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

  const search = async (searchQuery?: string) => {
    await calibreRootStore.searchtLibrary(searchQuery)
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
          search(e.nativeEvent.text)
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

  return (
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
          <Menu
            w="190"
            placement="left"
            trigger={(triggerProps) => {
              return (
                <IconButton
                  {...triggerProps}
                  mb="4"
                  variant="solid"
                  bg="yellow.400"
                  colorScheme="yellow"
                  borderRadius="full"
                  icon={
                    <Icon
                      as={MaterialCommunityIcons}
                      _dark={{
                        color: "warmGray.50",
                      }}
                      size="6"
                      name="sort"
                      color="warmGray.50"
                    />
                  }
                />
              )
            }}
          >
            {selectedLibrary.sortField.map((value) => {
              return (
                <Menu.ItemOption value={value.id} key={value.id}>
                  {value.name}
                </Menu.ItemOption>
              )
            })}
          </Menu>
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
})
