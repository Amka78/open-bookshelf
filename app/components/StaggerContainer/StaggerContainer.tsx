import { useConvergence } from "@/hooks/useConvergence"
import { IconButton, VStack } from "@/components"
import React, { useState } from "react"
export type StaggerContainerProps = {
  menus: React.ReactNode
  menusHeight: number
}
export function StaggerContainer(props: StaggerContainerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const convergenceHook = useConvergence()

  return (
    <>
      <VStack
        alignItems="center"
        position={"absolute"}
        bottom={convergenceHook.isLarge ? 10 : 5}
        right={convergenceHook.isLarge ? 10 : 5}
        justifyContent="flex-end"
      >
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
