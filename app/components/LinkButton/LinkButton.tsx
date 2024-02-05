import { Button, ButtonProps, VStack } from "@/components"

export type LinkButtonProps = Omit<ButtonProps, "children" | "onPress"> & {
  children: string | string[]
  onPress: (link: string) => void
}

export function LinkButton(props: LinkButtonProps) {
  if (Array.isArray(props.children)) {
    return (
      <VStack alignItems={"flex-start"}>
        {props.children.map((value) => {
          return (
            <Button
              variant="link"
              height={"$6"}
              onPress={() => {
                if (props.onPress) {
                  props.onPress(value)
                }
              }}
            >
              {value}
            </Button>
          )
        })}
      </VStack>
    )
  }
  return (
    <Button
      {...props}
      variant="link"
      height={"$6"}
      onPress={() => {
        if (props.onPress) {
          props.onPress(props.children)
        }
      }}
    >
      {props.children}
    </Button>
  )
}
