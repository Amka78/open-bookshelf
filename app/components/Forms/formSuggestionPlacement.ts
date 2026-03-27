export const resolveSuggestionPopoverPlacement = (isKeyboardVisible: boolean) => {
  return isKeyboardVisible ? "top left" : "bottom left"
}
