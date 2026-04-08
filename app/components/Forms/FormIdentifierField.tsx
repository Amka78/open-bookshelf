import { Box, HStack, IconButton, Input, VStack } from "@/components"
import { Text } from "@/components/Text/Text"
import { translate } from "@/i18n"
import { Controller, type ControllerProps, type FieldValues, type Path } from "react-hook-form"
import { InputField } from "../InputField/InputField"

/** Known Calibre identifier types for quick-add chips */
const KNOWN_IDENTIFIER_TYPES = ["isbn", "amazon", "google", "kobo", "uri", "asin", "douban"]

type IdentifierRow = { type: string; value: string }

/**
 * Serialize `{isbn: "123", amazon: "B001"}` → array of rows
 */
function mapToRows(map: Record<string, string> | null | undefined): IdentifierRow[] {
  if (!map) return [{ type: "", value: "" }]
  const entries = Object.entries(map)
  return entries.length > 0
    ? entries.map(([type, value]) => ({ type, value }))
    : [{ type: "", value: "" }]
}

/**
 * Serialize rows → `{isbn: "123", amazon: "B001"}`
 */
function rowsToMap(rows: IdentifierRow[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const row of rows) {
    const t = row.type.trim()
    const v = row.value.trim()
    if (t && v) result[t] = v
  }
  return result
}

export type FormIdentifierFieldProps<T extends FieldValues> = Omit<ControllerProps<T>, "render"> & {
  name: Path<T>
}

export function FormIdentifierField<T extends FieldValues>({
  control,
  name,
  rules,
  shouldUnregister,
  defaultValue,
  disabled,
}: FormIdentifierFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      shouldUnregister={shouldUnregister}
      defaultValue={defaultValue}
      disabled={disabled}
      render={({ field }) => {
        // MST snapshot: identifiers is a plain object (MobX map snapshot)
        const currentMap = (field.value as Record<string, string> | null | undefined) ?? {}
        const rows = mapToRows(currentMap)

        const updateRows = (nextRows: IdentifierRow[]) => {
          field.onChange(rowsToMap(nextRows))
        }

        const setRowType = (index: number, type: string) => {
          const next = rows.map((r, i) => (i === index ? { ...r, type } : r))
          updateRows(next)
        }

        const setRowValue = (index: number, value: string) => {
          const next = rows.map((r, i) => (i === index ? { ...r, value } : r))
          updateRows(next)
        }

        const addRow = (index: number, prefillType?: string) => {
          const next = [...rows]
          next.splice(index + 1, 0, { type: prefillType ?? "", value: "" })
          updateRows(next)
        }

        const removeRow = (index: number) => {
          const next = rows.filter((_, i) => i !== index)
          updateRows(next.length > 0 ? next : [{ type: "", value: "" }])
        }

        return (
          <VStack width="$full" space="xs">
            {/* Column headers */}
            <HStack space="xs">
              <Box flex={1}>
                <Text fontSize="$xs" color="$textLight500">
                  {translate("identifierField.typeLabel")}
                </Text>
              </Box>
              <Box flex={2}>
                <Text fontSize="$xs" color="$textLight500">
                  {translate("identifierField.valueLabel")}
                </Text>
              </Box>
              <Box w={72} />
            </HStack>

            {rows.map((row, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: identifier rows have no stable IDs; index is the only available key
      <HStack key={`identifier-row-${index}`} alignItems="center" space="xs">
                {/* Type input */}
                <Box flex={1}>
                  <Input size="sm">
                    <InputField
                      value={row.type}
                      onChangeText={(text) => setRowType(index, text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="isbn"
                      testID={`identifier-type-${index}`}
                    />
                  </Input>
                </Box>
                {/* Value input */}
                <Box flex={2}>
                  <Input size="sm">
                    <InputField
                      value={row.value}
                      onChangeText={(text) => setRowValue(index, text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      inputMode={row.type === "isbn" || row.type === "asin" ? "numeric" : "text"}
                      placeholder="9781234567890"
                      testID={`identifier-value-${index}`}
                    />
                  </Input>
                </Box>
                {/* Add/remove buttons */}
                <HStack space="xs" w={72}>
                  <IconButton name="plus" iconSize="sm" onPress={async () => addRow(index)} />
                  {rows.length > 1 || row.type || row.value ? (
                    <IconButton name="minus" iconSize="sm" onPress={async () => removeRow(index)} />
                  ) : null}
                </HStack>
              </HStack>
            ))}

            {/* Quick-add chips for common identifier types */}
            <HStack flexWrap="wrap" space="xs" mt="$1">
              {KNOWN_IDENTIFIER_TYPES.filter((t) => !rows.some((r) => r.type === t)).map((t) => (
                <Box
                  key={t}
                  borderWidth="$1"
                  borderRadius="$full"
                  px="$2"
                  py="$0.5"
                  onTouchEnd={() => addRow(rows.length - 1, t)}
                >
                  <Text fontSize="$xs">+{t}</Text>
                </Box>
              ))}
            </HStack>
          </VStack>
        )
      }}
    />
  )
}
