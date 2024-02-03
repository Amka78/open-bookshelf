import { Button, ButtonProps, HStack } from "@/components"

export type LinkButtonProps = Omit<ButtonProps, "children"> & {
  children: string | string[]
}

export function LinkButton(props: LinkButtonProps) {
  /*  if (props.children) {
    return (
      <HStack>
        {props.children.forEach((value) => {
          return (
            <Button {...props} variant="link" height={"$6"}>
              {value}
            </Button>
          )
        })}
      </HStack>
    )
  } */
  return (
    <Button {...props} variant="link" height={"$6"}>
      {props.children}
    </Button>
  )
}
