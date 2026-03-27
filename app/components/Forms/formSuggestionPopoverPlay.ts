export async function playKeyboardShownPlacesSuggestionsAbove({
  placement,
}: {
  placement: string
}) {
  if (placement !== "top left") {
    throw new Error(`Expected suggestion popover placement to be 'top left', but got '${placement}'.`)
  }
}
