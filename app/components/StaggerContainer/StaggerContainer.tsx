import { ModalStackParams } from "@/components/Modals/Types"
import { useConvergence } from "@/hooks/useConvergence"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Icon, IconButton, Stagger, useDisclose, VStack } from "native-base"
import React from "react"
export type StaggerContainerProps = {
  menus: React.ReactNode
  menusHeight: number
}
export function StaggerContainer(props: StaggerContainerProps) {
  const { isOpen, onToggle } = useDisclose()
  const convergenceHook = useConvergence()
  return (
    <>
      <Stagger
        visible={isOpen}
        initial={{
          opacity: 0,
          scale: 0,
          translateY: 34,
        }}
        animate={{
          translateY: 0,
          scale: 1,
          opacity: 1,
          transition: {
            type: "timing",
            mass: 0.8,
            stagger: {
              offset: 30,
              reverse: true,
            },
          },
        }}
        exit={{
          translateY: 34,
          scale: 0.5,
          opacity: 0,
          transition: {
            duration: 100,
            stagger: {
              offset: 30,
              reverse: true,
            },
          },
        }}
      >
        <VStack
          position={"absolute"}
          bottom={convergenceHook.isLarge ? 10 : 5}
          right={convergenceHook.isLarge ? 10 : 5}
          height={props.menusHeight}
        >
          {props.menus}
        </VStack>
      </Stagger>
      <IconButton
        variant="solid"
        bgColor={"coolGray.900"}
        borderRadius="full"
        size="lg"
        onPress={onToggle}
        position={"absolute"}
        bottom={convergenceHook.isLarge ? 10 : 5}
        right={convergenceHook.isLarge ? 10 : 5}
        icon={
          <Icon
            as={MaterialCommunityIcons}
            size="6"
            name="dots-horizontal"
            color="white"
            _dark={{
              color: "black",
            }}
          />
        }
      />
    </>
  )
}
