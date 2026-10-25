import { BookEditFieldNavList } from "@/components/BookEditFieldNavList/BookEditFieldNavList"
import { Button } from "@/components/Button/Button"
import { FormImageUploader } from "@/components/Forms/FormImageUploader"
import { HStack } from "@/components/HStack/HStack"
import { RootContainer } from "@/components/RootContainer/RootContainer"
import { ScrollView } from "@/components/ScrollView/ScrollView"
import { Text } from "@/components/Text/Text"
import { VStack } from "@/components/VStack/VStack"
import { useConvergence } from "@/hooks/useConvergence"
import { translate } from "@/i18n"
import type { MetadataSnapshotIn } from "@/models/calibre"
import type { AppStackParamList, ApppNavigationProp, BookFieldEditNavRequest } from "@/navigators/types"
import { Input, InputField } from "@gluestack-ui/themed"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import type { FC } from "react"
import { useLayoutEffect } from "react"
import type { Path } from "react-hook-form"
import { useBookEdit } from "./useBookEdit"

type BookEditScreenRouteProp = RouteProp<AppStackParamList, "BookEdit">

export const BookEditScreen: FC = observer(() => {
  const route = useRoute<BookEditScreenRouteProp>()
  const navigation = useNavigation<ApppNavigationProp>()
  const convergenceHook = useConvergence()
  const {
    form,
    selectedBook,
    selectedLibrary,
    onSubmit,
    onUploadFormat,
    coverUrlInput,
    setCoverUrlInput,
    isFetchingCover,
    fetchCoverError,
    fetchCoverFromUrl,
  } = useBookEdit()

  const handleOpenField = (request: BookFieldEditNavRequest) => {
    const formPath = request.formPath as Path<MetadataSnapshotIn>
    navigation.navigate("BookFieldEdit", {
      title: request.title,
      formPath: request.formPath,
      datatype: request.datatype,
      initialValue: form.getValues(formPath),
      suggestions: request.suggestions,
      textToValue: request.textToValue,
      valueToText: request.valueToText,
      onSave: (value) => {
        // biome-ignore lint/suspicious/noExplicitAny: react-hook-form setValue accepts the resolved field value type
        form.setValue(formPath as Path<MetadataSnapshotIn>, value as any, { shouldDirty: true })
      },
    })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: !convergenceHook.isLarge
        ? () => <Button tx={"bookEditScreen.save"} onPress={onSubmit} />
        : undefined,
    })
  }, [convergenceHook.isLarge, navigation, onSubmit])

  return (
    <RootContainer alignItems="center">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <VStack justifyContent="flex-start" flex={1}>
          <VStack testID="book-edit-screen-cover-container">
            <FormImageUploader
              // biome-ignore lint/suspicious/noExplicitAny: react-hook-form Control generic parameter mismatch between form and component expectations
              control={form.control as any}
              name={"cover"}
              defaultValue={route.params.imageUrl}
            />
            <VStack paddingHorizontal="$3" paddingTop="$2" space="xs">
              <Text tx="bookEditScreen.fetchCoverFromUrl" fontSize="$sm" fontWeight="$medium" />
              <HStack space="sm" alignItems="center">
                <Input flex={1} size="sm">
                  <InputField
                    value={coverUrlInput}
                    onChangeText={setCoverUrlInput}
                    placeholder={translate("bookEditScreen.fetchCoverUrlPlaceholder") ?? undefined}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </Input>
                <Button
                  tx={
                    isFetchingCover
                      ? "bookEditScreen.fetchingCover"
                      : "bookEditScreen.fetchCoverFromUrl"
                  }
                  onPress={fetchCoverFromUrl}
                  isDisabled={isFetchingCover || !coverUrlInput.trim()}
                  size="sm"
                />
              </HStack>
              {fetchCoverError ? (
                <Text tx="bookEditScreen.fetchCoverError" color="$red500" fontSize="$xs" />
              ) : null}
            </VStack>
          </VStack>
          <VStack testID="book-edit-screen-fields-container">
            <BookEditFieldNavList
              book={selectedBook}
              // biome-ignore lint/suspicious/noExplicitAny: react-hook-form Control generic parameter mismatch between form and component expectations
              control={form.control as any}
              fieldMetadataList={selectedLibrary.fieldMetadataList}
              tagBrowser={selectedLibrary.tagBrowser}
              onUploadFormat={onUploadFormat}
              onOpenField={handleOpenField}
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
    </RootContainer>
  )
})