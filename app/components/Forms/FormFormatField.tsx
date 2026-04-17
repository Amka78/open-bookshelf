import { HStack } from "@/components/HStack/HStack"
import { IconButton } from "@/components/IconButton/IconButton"
import { Input } from "@/components/Input/Input"
import { Pressable } from "@/components/Pressable/Pressable"
import { Text } from "@/components/Text/Text"
import { VStack } from "@/components/VStack/VStack"
import { Controller, type ControllerProps, type FieldValues } from "react-hook-form"

type UploadResult = {
  success: boolean
  format?: string
}

export type FormFormatFieldProps<T> = Omit<ControllerProps<T>, "render"> & {
  testID?: string
  onUploadFormat?: (params: { targetFormat?: string }) => Promise<UploadResult>
  onDeleteFormat?: (format: string) => Promise<boolean>
}

const normalizeFormat = (value: string | undefined | null) => {
  if (!value) {
    return ""
  }

  return value.replace(/^\./u, "").trim().toUpperCase()
}

export function FormFormatField<T extends FieldValues>(props: FormFormatFieldProps<T>) {
  const {
    control,
    name,
    rules,
    shouldUnregister,
    defaultValue,
    disabled,
    testID,
    onUploadFormat,
    onDeleteFormat,
  } = props

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      shouldUnregister={shouldUnregister}
      defaultValue={defaultValue}
      disabled={disabled}
      render={(renderProps) => {
        const formats = Array.isArray(renderProps.field.value)
          ? renderProps.field.value
              .map((value: unknown) => normalizeFormat(typeof value === "string" ? value : ""))
              .filter(Boolean)
          : []

        const baseTestId = testID ?? `form-format-input-${String(name)}`

        const updateFormats = (nextFormats: string[]) => {
          const uniqueFormats: string[] = []

          nextFormats.forEach((value) => {
            const normalized = normalizeFormat(value)
            if (!normalized || uniqueFormats.includes(normalized)) {
              return
            }
            uniqueFormats.push(normalized)
          })

          renderProps.field.onChange(uniqueFormats)
        }

        const handleReplace = async (index: number) => {
          if (!onUploadFormat) {
            return
          }

          const targetFormat = formats[index]
          const result = await onUploadFormat({ targetFormat })
          if (!result?.success) {
            return
          }

          const replacedFormat = normalizeFormat(result.format) || targetFormat
          const nextFormats = [...formats]
          nextFormats[index] = replacedFormat
          updateFormats(nextFormats)
        }

        const handleAdd = async () => {
          if (!onUploadFormat) {
            return
          }

          const result = await onUploadFormat({})
          if (!result?.success) {
            return
          }

          const uploadedFormat = normalizeFormat(result.format)
          if (!uploadedFormat) {
            return
          }

          if (formats.includes(uploadedFormat)) {
            return
          }

          updateFormats([...formats, uploadedFormat])
        }

        const handleDelete = async (index: number) => {
          const targetFormat = formats[index]
          if (!targetFormat) {
            return
          }

          if (onDeleteFormat) {
            const deleted = await onDeleteFormat(targetFormat)
            if (!deleted) {
              return
            }
          }

          const nextFormats = [...formats]
          nextFormats.splice(index, 1)
          updateFormats(nextFormats)
        }

        return (
          <VStack width="$full">
            {formats.map((format: string, index: number) => (
              <HStack
                key={`${String(name)}-format-row-${format}`}
                alignItems="center"
                marginBottom={index === formats.length - 1 ? undefined : "$4"}
              >
                <Pressable
                  onPress={() => {
                    void handleReplace(index)
                  }}
                  testID={`${baseTestId}-format-${index}`}
                >
                  <Input flex={1} width="$full" pointerEvents="none">
                    <Text>{format}</Text>
                  </Input>
                </Pressable>
                <IconButton
                  name="plus"
                  iconSize="sm"
                  testID={`${baseTestId}-plus-${index}`}
                  onPress={() => {
                    void handleAdd()
                  }}
                />
                {formats.length > 1 ? (
                  <IconButton
                    name="minus"
                    iconSize="sm"
                    testID={`${baseTestId}-minus-${index}`}
                    onPress={() => {
                      void handleDelete(index)
                    }}
                  />
                ) : null}
              </HStack>
            ))}
          </VStack>
        )
      }}
    />
  )
}
