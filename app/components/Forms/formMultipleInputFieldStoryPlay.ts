import { act, waitFor } from "@testing-library/react"

// Aggressive timeouts for parallel execution - fail fast strategy
const FAST_TIMEOUT = 500 // Shorter timeout to prevent hanging
const ULTRA_FAST_TIMEOUT = 200 // For elements that should appear immediately  
const RETRY_INTERVAL = 25 // Faster retry for quicker resolution

// Completely rewritten finder with fail-fast strategy and proper error boundaries
function createFailFastFinder() {
  return {
    async findByTestId(
      canvasElement: HTMLElement, 
      testId: string, 
      timeoutMs = FAST_TIMEOUT
    ): Promise<HTMLElement> {
      // Use React Testing Library's waitFor for better async handling
      let found: HTMLElement | null = null
      
      try {
        await waitFor(() => {
          found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
          if (!found) {
            throw new Error(`Element not found yet: ${testId}`)
          }
        }, { 
          timeout: timeoutMs, 
          interval: RETRY_INTERVAL,
          onTimeout: () => new Error(`Element with data-testid='${testId}' was not found within ${timeoutMs}ms`)
        })
        
        return found!
      } catch (error) {
        // Detailed error for debugging parallel execution issues
        const existingElements = canvasElement.querySelectorAll('[data-testid]')
        const existingIds = Array.from(existingElements).map(el => el.getAttribute('data-testid')).filter(Boolean)
        
        throw new Error(
          `Element with data-testid='${testId}' was not found within ${timeoutMs}ms. ` +
          `Available testIds: [${existingIds.join(', ')}]. ` +
          `Canvas HTML: ${canvasElement.innerHTML.substring(0, 200)}...`
        )
      }
    },

    async waitForAbsence(
      canvasElement: HTMLElement, 
      testId: string, 
      timeoutMs = FAST_TIMEOUT
    ): Promise<void> {
      try {
        await waitFor(() => {
          const found = canvasElement.querySelector(`[data-testid="${testId}"]`)
          if (found) {
            throw new Error(`Element still exists: ${testId}`)
          }
        }, { 
          timeout: timeoutMs, 
          interval: RETRY_INTERVAL,
          onTimeout: () => new Error(`Element with data-testid='${testId}' was expected to disappear within ${timeoutMs}ms`)
        })
      } catch (error) {
        throw new Error(`Element with data-testid='${testId}' was expected to disappear within ${timeoutMs}ms but is still present`)
      }
    }
  }
}

function typeInput(input: HTMLElement, value: string) {
  const htmlInput = input as HTMLInputElement
  const ownerDocument = htmlInput.ownerDocument
  const eventConstructor = ownerDocument?.defaultView?.Event
  
  if (!eventConstructor) {
    throw new Error("Event constructor is unavailable.")
  }

  htmlInput.value = value
  htmlInput.dispatchEvent(new eventConstructor("input", { bubbles: true }))
  htmlInput.dispatchEvent(new eventConstructor("change", { bubbles: true }))
}

async function waitForInputValue(
  input: HTMLInputElement, 
  expectedValue: string, 
  timeoutMs = FAST_TIMEOUT
): Promise<void> {
  try {
    await waitFor(() => {
      if (input.value !== expectedValue) {
        throw new Error(`Input value is '${input.value}', expected '${expectedValue}'`)
      }
    }, { 
      timeout: timeoutMs, 
      interval: RETRY_INTERVAL 
    })
  } catch (error) {
    throw new Error(`Expected input value to be '${expectedValue}', but got '${input.value}' within ${timeoutMs}ms.`)
  }
}

// Rewritten play functions with fail-fast strategy and proper act usage
const finder = createFailFastFinder()

export async function playMultipleFocusShowsSuggestions({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = await finder.findByTestId(canvasElement, "form-multiple-input-story-row-0")
  
  await act(async () => {
    input.focus()
  })

  // Quick check for suggestions with shorter timeout
  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", ULTRA_FAST_TIMEOUT)
}

export async function playMultipleSuggestionsStayVisibleAfterFocus({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await finder.findByTestId(canvasElement, "form-multiple-input-story-row-0")
  
  await act(async () => {
    input.focus()
  })

  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", ULTRA_FAST_TIMEOUT)
  
  // Reduced wait time for faster test execution
  await new Promise((resolve) => setTimeout(resolve, 300))
  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", ULTRA_FAST_TIMEOUT)
}

export async function playMultipleTypingFiltersSuggestions({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = await finder.findByTestId(canvasElement, "form-multiple-input-story-row-0")
  
  await act(async () => {
    input.focus()
  })
  
  await act(async () => {
    typeInput(input, "ga")
  })

  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Gamma", ULTRA_FAST_TIMEOUT)
  await finder.waitForAbsence(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", FAST_TIMEOUT)
}

export async function playMultipleTypingKeepsSuggestionsVisible({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await finder.findByTestId(canvasElement, "form-multiple-input-story-row-0")
  
  await act(async () => {
    input.focus()
  })
  
  await act(async () => {
    typeInput(input, "ga")
  })

  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Gamma", ULTRA_FAST_TIMEOUT)
  
  // Shorter wait time to prevent hanging in parallel execution
  await new Promise((resolve) => setTimeout(resolve, 200))
  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Gamma", ULTRA_FAST_TIMEOUT)
}

export async function playMultipleSelectSuggestionUpdatesInput({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = (await finder.findByTestId(
    canvasElement,
    "form-multiple-input-story-row-0",
  )) as HTMLInputElement
  
  await act(async () => {
    input.focus()
  })

  const candidate = await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Beta", ULTRA_FAST_TIMEOUT)
  
  await act(async () => {
    candidate.click()
  })

  await waitForInputValue(input, "Beta", FAST_TIMEOUT)
}

export async function playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = (await finder.findByTestId(
    canvasElement,
    "form-multiple-input-story-row-0",
  )) as HTMLInputElement
  
  await act(async () => {
    input.focus()
  })

  const candidateTestId = "form-multiple-input-tags-0-suggestion-Beta"
  const candidate = await finder.findByTestId(canvasElement, candidateTestId, ULTRA_FAST_TIMEOUT)
  
  await act(async () => {
    candidate.click()
  })

  await waitForInputValue(input, "Beta", FAST_TIMEOUT)
  await finder.waitForAbsence(canvasElement, candidateTestId, FAST_TIMEOUT)
}

export async function playMultipleOutsideClickClosesSuggestions({
  canvasElement,
}: { canvasElement: HTMLElement }) {
  const input = (await finder.findByTestId(
    canvasElement,
    "form-multiple-input-story-row-0",
  )) as HTMLInputElement
  
  await act(async () => {
    input.focus()
  })
  
  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", ULTRA_FAST_TIMEOUT)

  const outside = await finder.findByTestId(canvasElement, "form-multiple-input-story-outside")
  const ownerDocument = input.ownerDocument
  const mouseEventConstructor = ownerDocument?.defaultView?.MouseEvent
  
  if (!mouseEventConstructor) {
    throw new Error("MouseEvent constructor is unavailable.")
  }

  await act(async () => {
    outside.dispatchEvent(new mouseEventConstructor("mousedown", { bubbles: true }))
    input.blur()
    outside.click()
  })

  await finder.waitForAbsence(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", FAST_TIMEOUT)
}

export async function playMultipleBackdropPressClosesSuggestions({
  canvasElement,
}: {
  canvasElement: HTMLElement
}) {
  const input = await finder.findByTestId(canvasElement, "form-multiple-input-story-row-0")
  
  await act(async () => {
    input.focus()
  })

  await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", ULTRA_FAST_TIMEOUT)

  const backdrop = await finder.findByTestId(canvasElement, "form-multiple-input-tags-0-backdrop", ULTRA_FAST_TIMEOUT)
  
  await act(async () => {
    backdrop.click()
  })

  await finder.waitForAbsence(canvasElement, "form-multiple-input-tags-0-suggestion-Alpha", FAST_TIMEOUT)
}
