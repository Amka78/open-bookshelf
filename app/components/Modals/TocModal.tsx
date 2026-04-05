import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import { usePalette } from "@/theme"
import { Pressable, ScrollView, VStack } from "@gluestack-ui/themed"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams, TocItem } from "./Types"

export type TocModalProps = ModalComponentProp<ModalStackParams, void, "TocModal">

type TocEntryProps = {
  item: TocItem
  depth: number
  onSelect: (dest: string) => void
}

function TocEntry({ item, depth, onSelect }: TocEntryProps) {
  const palette = usePalette()
  return (
    <VStack>
      {item.title || item.dest ? (
        <Pressable
          onPress={() => {
            if (item.dest) onSelect(item.dest)
          }}
          style={{
            paddingVertical: 8,
            paddingLeft: 12 + depth * 16,
            paddingRight: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.borderSubtle,
          }}
        >
          <Text
            text={item.title ?? item.dest ?? ""}
            numberOfLines={1}
            color={palette.textPrimary}
          />
        </Pressable>
      ) : null}
      {item.children.map((child, idx) => (
        <TocEntry
          key={child.id != null ? child.id : `${depth}-${idx}`}
          item={child}
          depth={depth + 1}
          onSelect={onSelect}
        />
      ))}
    </VStack>
  )
}

export function TocModal(props: TocModalProps) {
  const toc: TocItem = props.modal.params.toc
  const onNavigate: (dest: string) => void = props.modal.params.onNavigate

  const hasChapters = toc.children.length > 0

  return (
    <Root>
      <Header>
        <Heading tx="toc.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        {hasChapters ? (
          <ScrollView>
            {toc.children.map((child, idx) => (
              <TocEntry
                key={child.id != null ? child.id : idx}
                item={child}
                depth={0}
                onSelect={(dest) => {
                  onNavigate(dest)
                  props.modal.closeModal()
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <Text tx="toc.noChapters" padding="$3" />
        )}
      </Body>
      <Footer>
        <Button onPress={() => props.modal.closeModal()} tx="common.cancel" />
      </Footer>
    </Root>
  )
}
