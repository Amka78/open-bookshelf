import { IconButton, VStack } from "@/components"
import { useConvergence } from "@/hooks/useConvergence"
import type React from "react"
import { type ComponentProps, useState } from "react"
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
  const [isOpen, setIsOpen] = useState(false)

  const bottom = restProps.bottom ? restProps.bottom : convergenceHook.isLarge ? 10 : 5
  const right = restProps.right ? restProps.right : convergenceHook.isLarge ? 10 : 5

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
