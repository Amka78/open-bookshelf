import { BookEditFieldList } from "@/components/BookEditFieldList/BookEditFieldList"
import { Button } from "@/components/Button/Button"
import { FormImageUploader } from "@/components/Forms/FormImageUploader"
import type { ModalStackParams } from "@/components/Modals/Types"
import { RootContainer } from "@/components/RootContainer/RootContainer"
import { ScrollView } from "@/components/ScrollView/ScrollView"
import { VStack } from "@/components/VStack/VStack"
import { useConvergence } from "@/hooks/useConvergence"
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useEffect, useLayoutEffect, useRef } from "react"
import { KeyboardAvoidingView, Platform, TextInput, UIManager, findNodeHandle } from "react-native"
import { useModal } from "react-native-modalfy"
import { useBookEdit } from "./useBookEdit"

type BookEditScreenRouteProp = RouteProp<AppStackParamList, "BookEdit">

// Height clearance above the focused field for the suggestion dropdown.
// MAX_SUGGESTIONS=5 items (~32px each) + container padding → ~220px
const SUGGESTION_AREA_CLEARANCE = 220

export const BookEditScreen: FC = observer(() => {
  const route = useRoute<BookEditScreenRouteProp>()
  const modal = useModal<ModalStackParams>()
  const navigation = useNavigation<ApppNavigationProp>()
  const convergenceHook = useConvergence()
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisibility()
  const { form, selectedBook, selectedLibrary, onSubmit, onUploadFormat, onDeleteFormat } =
    useBookEdit()
  const scrollViewRef = useRef<{
    scrollTo?: (options: { x?: number; y?: number; animated?: boolean }) => void
    scrollToEnd?: (options?: { animated?: boolean }) => void
  } | null>(null)
  const focusScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFocusScrollTimer = () => {
    if (focusScrollTimerRef.current != null) {
      clearTimeout(focusScrollTimerRef.current)
      focusScrollTimerRef.current = null
    }
  }

  const handleTextInputFocus = (getContainerHandle?: () => number | null) => {
    clearFocusScrollTimer()
    focusScrollTimerRef.current = setTimeout(() => {
      focusScrollTimerRef.current = null

      if (Platform.OS === "web") {
        scrollViewRef.current?.scrollToEnd?.({ animated: true })
        return
      }

      const scrollNode = findNodeHandle(scrollViewRef.current as any)

      // コンテナハンドルがある場合はラベルの先頭（container top）を基準にスクロール
      const containerHandle = getContainerHandle?.() ?? null
      if (containerHandle != null && scrollNode != null) {
        UIManager.measureLayout(
          containerHandle,
          scrollNode,
          () => {
            scrollViewRef.current?.scrollToEnd?.({ animated: true })
          },
          (_x: number, y: number) => {
            // ラベルが見えるよう少し余裕を持たせてスクロール（ラベル上部から50px上）
            const scrollY = Math.max(0, y - 50)
            scrollViewRef.current?.scrollTo?.({ y: scrollY, animated: true })
          },
        )
        return
      }

      // コンテナなし: フォーカス中の TextInput から位置を測定
      const focusedInput = TextInput.State.currentlyFocusedInput?.()
      if (focusedInput != null && scrollNode != null) {
        focusedInput.measureLayout(
          scrollNode as any,
          (_x: number, y: number) => {
            // ドロップダウンがある場合は上に SUGGESTION_AREA_CLEARANCE 分スペースを確保
            const scrollY = Math.max(0, y - SUGGESTION_AREA_CLEARANCE)
            scrollViewRef.current?.scrollTo?.({ y: scrollY, animated: true })
          },
          () => {
            scrollViewRef.current?.scrollToEnd?.({ animated: true })
          },
        )
      } else {
        scrollViewRef.current?.scrollToEnd?.({ animated: true })
      }
    }, 80)
  }

  useEffect(() => {
    return () => {
      if (focusScrollTimerRef.current != null) {
        clearTimeout(focusScrollTimerRef.current)
        focusScrollTimerRef.current = null
      }
    }
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: !convergenceHook.isLarge
        ? () => <Button tx={"bookEditScreen.save"} onPress={onSubmit} />
        : undefined,
    })
  }, [convergenceHook.isLarge, navigation, onSubmit])

  return (
    <RootContainer alignItems="center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
        testID="book-edit-screen-keyboard-avoiding"
      >
        <ScrollView
          ref={scrollViewRef as any}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: isKeyboardVisible ? keyboardHeight + 24 : 24,
          }}
          testID="book-edit-screen-scroll"
        >
          <VStack justifyContent="flex-start" flex={1}>
            {!isKeyboardVisible ? (
              <VStack testID="book-edit-screen-cover-container">
                <FormImageUploader
                  control={form.control as any}
                  name={"cover"}
                  defaultValue={route.params.imageUrl}
                />
              </VStack>
            ) : null}
            <VStack testID="book-edit-screen-fields-container">
              <BookEditFieldList
                book={selectedBook}
                control={form.control as any}
                fieldMetadataList={selectedLibrary.fieldMetadataList}
                tagBrowser={selectedLibrary.tagBrowser}
                onUploadFormat={onUploadFormat}
                onDeleteFormat={onDeleteFormat}
                onTextInputFocus={handleTextInputFocus}
                marginTop={"$3"}
              />
            </VStack>
          </VStack>
        </ScrollView>
        {convergenceHook.isLarge ? (
          <VStack justifyContent={"flex-end"} flex={1}>
            <Button tx={"bookEditScreen.save"} onPress={onSubmit} />
          </VStack>
        ) : null}
      </KeyboardAvoidingView>
    </RootContainer>
  )
})
