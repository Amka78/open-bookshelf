import { Box } from "@/components/Box/Box"
import { IconButton } from "@/components/IconButton/IconButton"
import { LeftSideMenu } from "@/components/LeftSideMenu/LeftSideMenu"
import type { ApppNavigationProp, AppStackParamList } from "@/navigators/types"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useLayoutEffect } from "react"
import { useDetailSearch } from "./useDetailSearch"

type DetailSearchScreenRouteProp = RouteProp<AppStackParamList, "DetailSearch">

export const DetailSearchScreen: FC = observer(() => {
  const route = useRoute<DetailSearchScreenRouteProp>()
  const navigation = useNavigation<ApppNavigationProp>()

  const {
    tagBrowser,
    itemOperators,
    itemCalibreOperators,
    pendingQuery,
    selectedNames,
    onNodePress,
    onItemOperatorChange,
    onItemCalibreOperatorChange,
  } = useDetailSearch(route.params.initialQuery)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          name="magnify"
          testID="detail-search-submit-button"
          onPress={() => {
            route.params.onSearch(pendingQuery)
            navigation.goBack()
          }}
        />
      ),
    })
  }, [navigation, pendingQuery, route.params])

  return (
    <Box flex={1} testID="detail-search-screen">
      <LeftSideMenu
        tagBrowser={tagBrowser}
        selectedNames={selectedNames}
        itemOperators={itemOperators}
        itemCalibreOperators={itemCalibreOperators}
        onNodePress={onNodePress}
        onItemOperatorChange={onItemOperatorChange}
        onItemCalibreOperatorChange={onItemCalibreOperatorChange}
      />
    </Box>
  )
})
