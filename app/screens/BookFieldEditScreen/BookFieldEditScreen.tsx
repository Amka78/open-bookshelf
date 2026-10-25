import { Button } from "@/components/Button/Button"
import { Box } from "@/components/Box/Box"
import { FormIdentifierField } from "@/components/Forms/FormIdentifierField"
import { FormMultipleInputField } from "@/components/Forms/FormMultipleInputField"
import { Pressable } from "@/components/Pressable/Pressable"
import { Input } from "@/components/Input/Input"
import { InputField } from "@/components/InputField/InputField"
import { ScrollView } from "@/components/ScrollView/ScrollView"
import { Text } from "@/components/Text/Text"
import { VStack } from "@/components/VStack/VStack"
import type { AppStackParamList, ApppNavigationProp } from "@/navigators/types"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { Textarea, TextareaInput } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { SafeAreaView } from "react-native-safe-area-context"

type BookFieldEditScreenRouteProp = RouteProp<AppStackParamList, "BookFieldEdit">

const MAX_SUGGESTIONS = 5

/**
 * 1フィールド専用の入力画面。
 * EditScreen の行タップから開き、確定すると onSave(value) → goBack() で
 * EditScreen が react-hook-form に反映する。保存自体は EditScreen の保存ボタンが担う。
 */
export const BookFieldEditScreen: FC = observer(() => {
  const route = useRoute<BookFieldEditScreenRouteProp>()
  const navigation = useNavigation<ApppNavigationProp>()
  const { title, datatype, initialValue, suggestions, textToValue, valueToText, onSave } =
    route.params

  // multiple / identifiers は既存フォーム部品（Controllerベース）を再利用するため
  // 画面内に単一フィールドのローカルフォームを持つ
  const localForm = useForm<{ value: unknown }>({
    defaultValues: { value: initialValue },
  })

  const [textValue, setTextValue] = useState(initialValue == null ? "" : String(initialValue))
  const [isFocused, setIsFocused] = useState(false)

  const candidateValues = useMemo(() => {
    const raw = textValue.trim().toLowerCase()
    const result: string[] = []
    for (const suggestion of suggestions ?? []) {
      const trimmed = suggestion.trim()
      if (!trimmed) continue
      if (raw.length > 0 && !trimmed.toLowerCase().includes(raw)) continue
      result.push(trimmed)
      if (result.length >= MAX_SUGGESTIONS) break
    }
    return result
  }, [suggestions, textValue])

  const commit = useCallback(() => {
    if (datatype === "multiple" || datatype === "identifiers") {
      onSave(localForm.getValues("value"))
      navigation.goBack()
      return
    }
    // comments は旧 BookEditCommentsField と同じく空文字を保持する
    if (datatype === "comments") {
      onSave(textValue)
      navigation.goBack()
      return
    }
    onSave(textValue === "" ? null : textValue)
    navigation.goBack()
  }, [datatype, localForm, navigation, onSave, textValue])

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <Button tx="bookEditScreen.save" onPress={commit} size="sm" marginRight={"$2"} />
      ),
    })
  }, [navigation, title, commit])

  const renderEditor = () => {
    switch (datatype) {
      case "int":
      case "float":
        return (
          <Input>
            <InputField
              value={textValue}
              onChangeText={setTextValue}
              inputMode="numeric"
              testID="book-field-edit-input"
            />
          </Input>
        )
      case "comments":
        return (
          <Textarea width="$full">
            <TextareaInput
              value={textValue}
              onChangeText={setTextValue}
              testID="book-field-edit-input"
            />
          </Textarea>
        )
      case "multiple":
        return (
          <FormMultipleInputField
            // biome-ignore lint/suspicious/noExplicitAny: 画面内ローカルフォームの単一フィールドを流用するため
            control={localForm.control as any}
            name="value"
            textToValue={textToValue ?? ","}
            valueToText={valueToText ?? ""}
            suggestions={suggestions}
          />
        )
      case "identifiers":
        return (
          <FormIdentifierField
            // biome-ignore lint/suspicious/noExplicitAny: 画面内ローカルフォームの単一フィールドを流用するため
            control={localForm.control as any}
            name="value"
          />
        )
      // text 系はデフォルトブランチで処理（サジェストはポップオーバーでなく入力欄下のリスト表示）
      default:
        return (
          <VStack width="$full" space="sm">
            <Input>
              <InputField
                value={textValue}
                onChangeText={setTextValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                testID="book-field-edit-input"
              />
            </Input>
            {isFocused && candidateValues.length > 0 ? (
              <VStack space="xs" testID="book-field-edit-suggestions">
                {candidateValues.map((candidate) => (
                  <Pressable
                    key={candidate}
                    testID={`book-field-edit-suggestion-${encodeURIComponent(candidate)}`}
                    onPress={() => {
                      setTextValue(candidate)
                      setIsFocused(false)
                    }}
                  >
                    <Box
                      borderWidth="$1"
                      borderRadius="$sm"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                    >
                      <Text fontSize="$sm" isTruncated={true}>
                        {candidate}
                      </Text>
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            ) : null}
          </VStack>
        )
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="md" width="$full">
          <Text fontWeight="$bold" isTruncated={true}>
            {title}
          </Text>
          {renderEditor()}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  )
})