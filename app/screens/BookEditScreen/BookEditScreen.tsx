import { BookEditFieldList } from "@/components/BookEditFieldList/BookEditFieldList"
import { Button } from "@/components/Button/Button"
import { FormImageUploader } from "@/components/Forms/FormImageUploader"
import { RootContainer } from "@/components/RootContainer/RootContainer"
import { ScrollView } from "@/components/ScrollView/ScrollView"
import { VStack } from "@/components/VStack/VStack"
import type { ModalStackParams } from "@/components/Modals/Types"
import { useConvergence } from "@/hooks/useConvergence"
import { useKeyboardVisibility } from "@/hooks/useKeyboardVisibility"
import type { ApppNavigationProp, AppStackParamList } from "@/navigators/types"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"
import { KeyboardAvoidingView, Platform } from "react-native"
import { useModal } from "react-native-modalfy"
import { useBookEdit } from "./useBookEdit"

type BookEditScreenRouteProp = RouteProp<AppStackParamList, "BookEdit">

export const BookEditScreen: FC = observer(() => {
  const route = useRoute<BookEditScreenRouteProp>()
  const modal = useModal<ModalStackParams>()
  const navigation = useNavigation<ApppNavigationProp>()
  const convergenceHook = useConvergence()
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisibility()
  const { form, selectedBook, selectedLibrary, onSubmit, onUploadFormat, onDeleteFormat } =
    useBookEdit()
  const scrollViewRef = useRef<{ scrollToEnd?: (options?: { animated?: boolean }) => void } | null>(
    null,
  )
  const focusScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFocusScrollTimer = useCallback(() => {
    if (focusScrollTimerRef.current != null) {
      clearTimeout(focusScrollTimerRef.current)
      focusScrollTimerRef.current = null
    }
  }, [])

  const handleTextInputFocus = useCallback(() => {
    clearFocusScrollTimer()
    focusScrollTimerRef.current = setTimeout(() => {
      focusScrollTimerRef.current = null
      scrollViewRef.current?.scrollToEnd?.({ animated: true })
    }, 80)
  }, [clearFocusScrollTimer])

  useEffect(() => {
    return () => {
      clearFocusScrollTimer()
    }
  }, [clearFocusScrollTimer])

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
          ref={scrollViewRef}
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
