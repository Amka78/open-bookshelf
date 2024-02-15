import { Button, ButtonProps, HStack, VStack, Text } from "@/components"

export type LinkInfo = {
  value: string
  label?: string
}
export type LinkButtonProps = Omit<ButtonProps, "children" | "onPress"> & {
  children: LinkInfo | LinkInfo[]
  conjunction?: string
  onPress: (link: string) => void
}

export function LinkButton(props: LinkButtonProps) {
  if (Array.isArray(props.children)) {
    const linkInfos = props.children as LinkInfo[]
    return (
      <VStack alignItems={"flex-start"}>
        {linkInfos.map((linkInfo, index) => {
          let link = (
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

          if (index <= linkInfos.length && props.conjunction) {
            link = (
              <HStack>
                {link}
                <Text>{props.conjunction}</Text>
              </HStack>
            )
          }

          return link
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
