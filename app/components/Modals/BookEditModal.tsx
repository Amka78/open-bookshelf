import { BookEditFieldList } from "@/components/BookEditFieldList/BookEditFieldList"
import { Button } from "@/components/Button/Button"
import { FormImageUploader } from "@/components/Forms/FormImageUploader"
import { HStack } from "@/components/HStack/HStack"
import { Heading } from "@/components/Heading/Heading"
import type { ModalComponentProp } from "react-native-modalfy"

import { useStores } from "@/models"
import type { MetadataSnapshotIn } from "@/models/calibre"
import type { AddedFormatEntry } from "@/services/api/api.types"
import { logger } from "@/utils/logger"
import * as DocumentPicker from "expo-document-picker"
import { observer } from "mobx-react-lite"
import { getSnapshot } from "mobx-state-tree"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type BookEditModalProps = ModalComponentProp<ModalStackParams, void, "BookEditModal">
type BookEditModalTemplateProps = ModalComponentProp<ModalStackParams, object, "BookEditModal"> & {
  onUploadFormat?: (params: { targetFormat?: string }) => Promise<{
    success: boolean
    format?: string
  }>
}

export const BookEditModal = observer((props: BookEditModalProps) => {
  const { calibreRootStore } = useStores()

  const selectedLibrary = calibreRootStore.selectedLibrary
  const selectedBook = selectedLibrary.selectedBook

  const normalizeFormat = (value: string | undefined | null) => {
    return String(value ?? "")
      .replace(/^\./u, "")
      .trim()
      .toUpperCase()
  }

  const pickFormatFromAssetName = (assetName: string | undefined, fallback?: string) => {
    const normalizedFallback = normalizeFormat(fallback)

    const name = String(assetName ?? "").trim()
    const extensionFromName = name.includes(".") ? name.split(".").pop() : undefined
    const normalizedFromName = normalizeFormat(extensionFromName)

    return normalizedFromName || normalizedFallback || undefined
  }

  const pendingAddedFormats = useRef<AddedFormatEntry[]>([])

  const onUploadFormat = async ({ targetFormat }: { targetFormat?: string }) => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
    })

    if (result.canceled || result.assets.length === 0) {
      return { success: false }
    }

    const pickedAsset = result.assets[0]
    const pickedFormat = targetFormat
      ? normalizeFormat(targetFormat)
      : pickFormatFromAssetName(pickedAsset?.name, targetFormat)

    if (!pickedFormat) {
      return { success: false }
    }

    const filePayload = pickedAsset.file ?? pickedAsset.uri
    if (!filePayload) {
      return { success: false }
    }

    try {
      const { fileToDataUrl } = await import("@/utils/fileToDataUrl")
      const dataUrl = await fileToDataUrl(filePayload)

      pendingAddedFormats.current = pendingAddedFormats.current.filter(
        (e) => e.ext.toUpperCase() !== pickedFormat,
      )
      pendingAddedFormats.current.push({
        ext: pickedFormat,
        data_url: dataUrl,
        name: pickedAsset.name,
        size: pickedAsset.size ?? 0,
        type: pickedAsset.mimeType ?? "application/octet-stream",
      })

      return { success: true, format: pickedFormat }
    } catch {
      return { success: false }
    }
  }

  const originalFormats = selectedBook.metaData
    ? [...(getSnapshot(selectedBook.metaData) as MetadataSnapshotIn).formats]
    : []

  return (
    <BookEditModalTemplate
      onUploadFormat={onUploadFormat}
      modal={{
        ...props.modal,
        params: {
          ...props.modal.params,
          selectedBook: selectedBook,
          fieldMetadataList: selectedLibrary.fieldMetadataList,
          tagBrowser: selectedLibrary.tagBrowser,
          onOKPress(value, updateFields) {
            // Compute removed formats
            const currentFormats = (value.formats ?? []).map((f: string) =>
              String(f).toUpperCase(),
            )
            const removedFormats = originalFormats
              .map((f) => String(f).toUpperCase())
              .filter((f) => !currentFormats.includes(f))

            const formatChanges =
              removedFormats.length > 0 || pendingAddedFormats.current.length > 0
                ? {
                    removed_formats: removedFormats.length > 0 ? removedFormats : undefined,
                    added_formats:
                      pendingAddedFormats.current.length > 0
                        ? pendingAddedFormats.current
                        : undefined,
                  }
                : undefined

            selectedBook.update(selectedLibrary.id, value, updateFields, formatChanges)
            props.modal.closeModal()
          },
        },
      }}
    />
  )
})
export function BookEditModalTemplate(props: BookEditModalTemplateProps) {
  const rawSnapshot = props.modal.params.selectedBook.metaData
    ? (getSnapshot(props.modal.params.selectedBook.metaData) as MetadataSnapshotIn)
    : undefined
  const langNames = rawSnapshot?.langNames ?? {}
  const hasLangNames = Object.keys(langNames).length > 0
  const defaultValues =
    rawSnapshot && hasLangNames
      ? {
          ...rawSnapshot,
          languages: rawSnapshot.languages
            .map((entry) => String(entry ?? "").trim())
            .filter(Boolean)
            .map((entry) => {
              const nameSet = new Set(Object.values(langNames as Record<string, string>))
              if (nameSet.has(entry)) return entry
              return (langNames as Record<string, string>)[entry] ?? entry
            }),
        }
      : rawSnapshot
  const form = useForm<MetadataSnapshotIn, unknown, MetadataSnapshotIn>({
    defaultValues,
  })

  return (
    <Root>
      <Header>
        <Heading isTruncated={true} tx={"modal.bookEditModal.title"} />
        <CloseButton
          onPress={() => {
            props.modal.closeModal()
          }}
        />
      </Header>
      <Body>
        <HStack space={"sm"}>
          <FormImageUploader
            control={form.control}
            name={"cover"}
            defaultValue={props.modal.params.imageUrl}
          />
          <BookEditFieldList
            book={props.modal.params.selectedBook}
            control={form.control}
            fieldMetadataList={props.modal.params.fieldMetadataList}
            tagBrowser={props.modal.params.tagBrowser}
            onUploadFormat={props.onUploadFormat}
            height={320}
            width={240}
          />
        </HStack>
      </Body>
      <Footer>
        <Button
          onPress={form.handleSubmit((value) => {
            logger.debug("BookEditModal dirty fields", form.formState.dirtyFields)
            if (props.modal.params.onOKPress) {
              props.modal.params.onOKPress(value, Object.keys(form.formState.dirtyFields))
            }
            //props.modal.closeModal()
          })}
          tx={"common.ok"}
          disabled={Object.keys(form.formState.dirtyFields).length <= 0}
        />
        <Button
          onPress={() => {
            props.modal.closeModal()
          }}
          tx={"common.cancel"}
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
}
