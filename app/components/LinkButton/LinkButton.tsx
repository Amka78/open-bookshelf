import { Button, type ButtonProps, HStack, Text, VStack } from "@/components"

export type LinkInfo = {
  value: string
  label?: string
}
export type LinkButtonProps = Omit<ButtonProps, "children" | "onPress"> & {
  children: LinkInfo | LinkInfo[]
  links?: LinkInfo | LinkInfo[]
  conjunction?: string
  onPress: (link: string) => void
}

export function LinkButton(props: LinkButtonProps) {
  const links = props.links ? props.links : props.children
  if (Array.isArray(links)) {
    const linkInfos = links as LinkInfo[]
    return (
      <HStack flexWrap="wrap" flex={1} alignContent={"flex-start"}>
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

          if (index < linkInfos.length - 1 && props.conjunction) {
            link = (
              <HStack>
                {link}
                <Text>{props.conjunction}</Text>
              </HStack>
            )
          }

          return link
        })}
      </HStack>
    )
  }
  return (
    <Button
      {...props}
      variant="link"
      height={"$6"}
      onPress={() => {
        if (props.onPress) {
          props.onPress((links as LinkInfo).value)
        }
      }}
    >
      {links.label ? links.label : links.value}
    </Button>
  )
}
