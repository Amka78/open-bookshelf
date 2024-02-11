import { Button, ButtonProps, VStack } from "@/components"

type LinkInfo = {
  value: string
  label?: string
}
export type LinkButtonProps = Omit<ButtonProps, "children" | "onPress"> & {
  children: LinkInfo | LinkInfo[]
  onPress: (link: string) => void
}

export function LinkButton(props: LinkButtonProps) {
  if (Array.isArray(props.children)) {
    return (
      <VStack alignItems={"flex-start"}>
        {props.children.map((linkInfo) => {
          return (
            <Button
              variant="link"
              height={"$6"}
              onPress={() => {
                if (props.onPress) {
                  props.onPress(linkInfo.value)
                }
              }}
            >
              {linkInfo.label ? linkInfo.label : linkInfo.value}
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
          props.onPress((props.children as LinkInfo).value)
        }
      }}
    >
      {props.children.label ? props.children.label : props.children.value}
    </Button>
  )
}
