import { MaterialCommunityIcons } from "@expo/vector-icons"
import { IconButton, IIconButtonProps, IIconProps, Icon } from "native-base"

export type StaggerButtonProps = IIconButtonProps &
  Pick<IIconProps, "_dark" | "name" | "color" | "name"> & { as?: any; iconSize?: string }

export function StaggerButton({
  borderRadius = "full",
  variant = "solid",
  as = MaterialCommunityIcons,
  iconSize = "6",
  ...restProps
}: StaggerButtonProps) {
  const props = { as, borderRadius, iconSize, variant, ...restProps }
  return (
    <IconButton
      {...props}
      icon={
        <Icon
          as={props.as}
          size={props.iconSize}
          name={props.name}
          color={props.color}
          _dark={props._dark}
        />
      }
    />
  )
}
