import { IconButton } from "@/components"
import type { IconButtonProps } from "@/components"
import type { MessageKey } from "@/i18n"
import { translate } from "@/i18n"
import { Tooltip, TooltipContent, TooltipText, Box } from "@gluestack-ui/themed"

export type TooltipIconButtonProps = IconButtonProps & {
  tooltipTx?: MessageKey
}

export function TooltipIconButton(props: TooltipIconButtonProps) {
  const { tooltipTx, ...restProps } = props

  return tooltipTx ? (
    <Tooltip placement="bottom" trigger={(triggerProps) => {
      return (
        <Box {...triggerProps}>
          <IconButton {...restProps} />
        </Box>
      )
    }}>
      <TooltipContent>
        <TooltipText>{translate(tooltipTx)}</TooltipText>
      </TooltipContent>
    </Tooltip>
  ) : (
    <IconButton {...restProps} />
  )
}
