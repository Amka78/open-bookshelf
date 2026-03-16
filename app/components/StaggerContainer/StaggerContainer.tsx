import { IconButton, VStack } from "@/components"
import { useConvergence } from "@/hooks/useConvergence"
import type React from "react"
import { type ComponentProps, useState } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
export type StaggerContainerProps = {
  menus: React.ReactNode
  menusHeight: number
} & ComponentProps<typeof VStack>
export function StaggerContainer({
  position = "absolute",
  alignItems = "center",
  justifyContent = "flex-end",
  ...restProps
}: StaggerContainerProps) {
  const convergenceHook = useConvergence()
  const insets = useSafeAreaInsets()
  const [isOpen, setIsOpen] = useState(false)

  const defaultBottom = (convergenceHook.isLarge ? 10 : 5) + insets.bottom
  const bottom = restProps.bottom ?? defaultBottom
  const right = restProps.right ?? (convergenceHook.isLarge ? 10 : 5)

  const props = { position, alignItems, justifyContent, bottom, right, ...restProps }
  return (
    <>
      <VStack {...props}>
        {isOpen ? (
          <VStack space="sm" marginBottom={"$1"}>
            {props.menus}
          </VStack>
        ) : null}
        <IconButton
          name={"menu"}
          onPress={() => {
            setIsOpen(!isOpen)
          }}
          variant="staggerRoot"
        />
      </VStack>
    </>
  )
}
