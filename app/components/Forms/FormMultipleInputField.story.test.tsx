import { afterAll, beforeAll, beforeEach, describe as baseDescribe, test as baseTest, jest, mock } from "bun:test"
import { act, render, cleanup, waitFor } from "@testing-library/react"
import type { ComponentType, ReactNode } from "react"
import { useForm } from "react-hook-form"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"
import {
  playMultipleBackdropPressClosesSuggestions,
  playMultipleFocusShowsSuggestions,
  playMultipleOutsideClickClosesSuggestions,
  playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput,
  playMultipleSelectSuggestionUpdatesInput,
  playMultipleSuggestionsStayVisibleAfterFocus,
  playMultipleTypingFiltersSuggestions,
  playMultipleTypingKeepsSuggestionsVisible,
} from "./formMultipleInputFieldStoryPlay"

// Complete isolation strategy for parallel execution
const TEST_NAMESPACE = `FormMultiple_${process.pid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
const TEST_CONTAINER_CLASS = `test-container-${TEST_NAMESPACE}`

// Aggressive cleanup and isolation
let isTestEnvironmentSetup = false
const originalConsoleError = console.error

beforeAll(() => {
  if (!isTestEnvironmentSetup) {
    // Silence React warnings for this test instance only
    console.error = (message: unknown, ...args: unknown[]) => {
      const messageStr = String(message)
      if (
        messageStr.includes("React does not recognize") || 
        messageStr.includes("DOM element") ||
        messageStr.includes("act")
      ) {
        return
      }
      originalConsoleError(message, ...args)
    }
    isTestEnvironmentSetup = true
  }
})

afterAll(() => {
  console.error = originalConsoleError
  cleanup()
  // Clean up any residual DOM elements
  const testContainers = document.querySelectorAll(`.${TEST_CONTAINER_CLASS}`)
  testContainers.forEach(container => container.remove())
})

beforeEach(() => {
  cleanup()
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
})

// Completely isolated mock system
const createCompletelyIsolatedMocks = () => {
  const testId = TEST_NAMESPACE
  
  return {
    Box: ({
      children,
      testID,
      ...props
    }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => {
      const { width, flex, ...domProps } = props
      return (
        <div 
          data-testid={testID} 
          data-test-ns={testId}
          className={TEST_CONTAINER_CLASS}
          {...(domProps as object)} 
          style={{ width: width as string, flex: flex as string }}
        >
          {children}
        </div>
      )
    },
    Image: ({ testID, ...props }: Record<string, unknown> & { testID?: string; alt?: string }) => (
      <img 
        data-testid={testID} 
        data-test-ns={testId}
        className={TEST_CONTAINER_CLASS}
        {...(props as object)} 
        alt={(props as { alt?: string }).alt ?? ""} 
      />
    ),
    Text: ({
      children,
      testID,
      ...props
    }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => (
      <span 
        data-testid={testID} 
        data-test-ns={testId}
        className={TEST_CONTAINER_CLASS}
        {...(props as object)}
      >
        {children}
      </span>
    ),
    HStack: ({ 
      children, 
      testID, 
      ...props 
    }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => {
      const { alignItems, marginBottom, flex, ...domProps } = props
      return (
        <div 
          data-testid={testID} 
          data-test-ns={testId}
          className={TEST_CONTAINER_CLASS}
          {...(domProps as object)} 
          style={{ 
            display: 'flex', 
            alignItems: alignItems as string, 
            marginBottom: marginBottom as string 
          }}
        >
          {children}
        </div>
      )
    },
    VStack: ({
      children,
      testID,
      ...props
    }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => {
      const { width, padding, ...domProps } = props
      return (
        <div 
          data-testid={testID} 
          data-test-ns={testId}
          className={TEST_CONTAINER_CLASS}
          {...(domProps as object)} 
          style={{ width: width as string, padding: padding as string }}
        >
          {children}
        </div>
      )
    },
    Input: ({ 
      children, 
      testID, 
      ...props 
    }: Record<string, unknown> & { children?: ReactNode; testID?: string }) => {
      const { width, ...domProps } = props
      return (
        <div 
          data-testid={testID} 
          data-test-ns={testId}
          className={TEST_CONTAINER_CLASS}
          {...(domProps as object)} 
          style={{ width: width as string }}
        >
          {children}
        </div>
      )
    },
    IconButton: ({ testID, onPress }: { testID?: string; onPress?: () => void }) => (
      <button 
        data-testid={testID} 
        data-test-ns={testId}
        className={TEST_CONTAINER_CLASS}
        type="button" 
        onClick={onPress}
      >
        icon
      </button>
    ),
  }
}

const isolatedMocks = createCompletelyIsolatedMocks()

// Isolated theme mock
mock.module("@/theme", () => ({
  usePalette: jest.fn(() => ({
    surface: "#111",
    borderStrong: "#333", 
    accent: "#999",
  })),
}))

// Component mocks with complete isolation
mock.module("@/components", () => isolatedMocks)

mock.module("@/components/Box/Box", () => ({
  Box: isolatedMocks.Box,
}))

mock.module("@/components/Text/Text", () => ({
  Text: isolatedMocks.Text,
}))

mock.module("@/components/Pressable/Pressable", () => ({
  Pressable: ({
    children,
    onPress,
    testID,
    ...props
  }: { children?: ReactNode; onPress?: () => void; testID?: string }) => (
    <button 
      data-testid={testID} 
      data-test-ns={TEST_NAMESPACE}
      className={TEST_CONTAINER_CLASS}
      {...(props as object)} 
      type="button" 
      onClick={onPress}
    >
      {children}
    </button>
  ),
}))

mock.module("./FormSuggestionPopover", () => ({
  FormSuggestionPopover: ({
    trigger,
    isOpen,
    onClose,
    candidates,
    onSelect,
    testIdPrefix,
  }: {
    trigger: (props: Record<string, unknown>) => ReactNode
    isOpen: boolean
    onClose: () => void
    candidates: string[]
    onSelect: (candidate: string) => void
    testIdPrefix: string
  }) => (
    <div data-test-ns={TEST_NAMESPACE} className={TEST_CONTAINER_CLASS}>
      {trigger({})}
      {isOpen ? (
        <div data-test-ns={TEST_NAMESPACE} className={TEST_CONTAINER_CLASS}>
          <button 
            data-testid={`${testIdPrefix}-backdrop`} 
            data-test-ns={TEST_NAMESPACE}
            className={TEST_CONTAINER_CLASS}
            type="button" 
            onClick={onClose}
          >
            backdrop
          </button>
          <div 
            data-testid={`${testIdPrefix}-suggestions`} 
            data-test-ns={TEST_NAMESPACE}
            className={TEST_CONTAINER_CLASS}
          >
            {candidates.map((candidate) => (
              <button
                key={candidate}
                data-testid={`${testIdPrefix}-suggestion-${encodeURIComponent(candidate)}`}
                data-test-ns={TEST_NAMESPACE}
                className={TEST_CONTAINER_CLASS}
                type="button"
                onClick={() => onSelect(candidate)}
              >
                {candidate}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  ),
}))

mock.module("../InputField/InputField", () => ({
  InputField: ({
    onChangeText,
    value,
    onFocus,
    onBlur,
    testID,
  }: {
    onChangeText?: (text: string) => void
    value?: string
    onFocus?: () => void
    onBlur?: () => void
    testID?: string
  }) => (
    <input
      data-testid={testID}
      data-test-ns={TEST_NAMESPACE}
      className={TEST_CONTAINER_CLASS}
      value={value ?? ""}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={(event) => {
        onChangeText?.((event.currentTarget as HTMLInputElement).value)
      }}
      onChange={(event) => {
        onChangeText?.(event.currentTarget.value)
      }}
    />
  ),
}))

type StoryForm = {
  tags: string[]
}

let FormMultipleInputField: ComponentType<{
  control: ReturnType<typeof useForm<StoryForm>>["control"]
  name: "tags"
  suggestions: string[]
  width: "$full"
  testID: string
  textToValue: string
  valueToText: string
}>

beforeAll(async () => {
  const imported = await import("./FormMultipleInputField")
  FormMultipleInputField = imported.FormMultipleInputField as typeof FormMultipleInputField
})

function TestHarness({ suggestions }: { suggestions: string[] }) {
  const form = useForm<StoryForm>({
    defaultValues: {
      tags: [""],
    },
  })

  return (
    <div data-test-ns={TEST_NAMESPACE} className={TEST_CONTAINER_CLASS}>
      <FormMultipleInputField
        control={form.control}
        name="tags"
        suggestions={suggestions}
        width="$full"
        testID="form-multiple-input-story"
        textToValue=","
        valueToText=","
      />
      <button 
        data-testid="form-multiple-input-story-outside" 
        data-test-ns={TEST_NAMESPACE}
        className={TEST_CONTAINER_CLASS}
        type="button"
      >
        Outside
      </button>
    </div>
  )
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

// Wrapped test functions with timeout protection to prevent hanging
function testWithTimeout(testName: string, testFn: () => Promise<void>, timeoutMs = 10000) {
  return test(testName, async () => {
    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Test '${testName}' timed out after ${timeoutMs}ms`))
      }, timeoutMs)
      // Ensure timer is cleared if test completes
      return timer
    })

    const testPromise = testFn()

    try {
      await Promise.race([testPromise, timeoutPromise])
    } finally {
      // Clean up any remaining timers/promises
      cleanup()
    }
  })
}

describe("FormMultipleInputField story play", () => {
  testWithTimeout("focus shows suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleFocusShowsSuggestions({ canvasElement: container })
  }, 3000)

  testWithTimeout("suggestions stay visible after focus", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleSuggestionsStayVisibleAfterFocus({ canvasElement: container })
  }, 5000)

  testWithTimeout("typing filters suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleTypingFiltersSuggestions({ canvasElement: container })
  }, 3000)

  testWithTimeout("typing keeps suggestions visible", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleTypingKeepsSuggestionsVisible({ canvasElement: container })
  }, 4000)

  testWithTimeout("selecting suggestion updates input value", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleSelectSuggestionUpdatesInput({ canvasElement: container })
  }, 3000)

  testWithTimeout("selecting suggestion closes suggestions and updates input value", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleSelectSuggestionClosesSuggestionsAndUpdatesInput({ canvasElement: container })
  }, 3000)

  testWithTimeout("outside click closes suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleOutsideClickClosesSuggestions({ canvasElement: container })
  }, 3000)

  testWithTimeout("backdrop press closes suggestions", async () => {
    const { container } = render(<TestHarness suggestions={["Alpha", "Beta", "Gamma", "Delta"]} />)
    await playMultipleBackdropPressClosesSuggestions({ canvasElement: container })
  }, 3000)
})
