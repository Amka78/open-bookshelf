# Copilot Instructions

## Project Overview

Open BookShelf is a cross-platform digital book library manager built with React Native + Expo. It integrates with [Calibre](https://calibre-ebook.com/) servers and OPDS catalogs to browse, manage, and read ebooks. It targets iOS, Android, Web, and Desktop (via Electrobun).

## Commands

```bash
bun run start              # Start Expo dev client
bun run expo:ios           # iOS simulator
bun run expo:android       # Android emulator
bun run expo:web           # Web dev server
bun run desktop            # Electrobun desktop dev

bun run lint               # Biome lint
bun run format             # Biome format
bun run compile            # TypeScript type check

bun run test               # All Jest unit tests
bun run test:unit          # Unit tests only (bun test)
bun run test:unit -- --testPathPattern="FileName"  # Single test file
bun run test:detox         # Detox E2E (iOS)

bun run storybook:web      # Web Storybook
bun run storybook:native   # Native Storybook
bun run build:web          # Production web build (GitHub Pages)
```

## Architecture

### State Management — MobX State Tree

All app state lives in MST models under `app/models/`. The root store composes child stores:

```
RootStore
├── authenticationStore   — JWT token, login/logout
├── settingStore          — server URL, preferences
├── calibreRootStore      — Calibre library, books, metadata
└── opdsRootStore         — OPDS catalog browsing
```

Models follow the pattern: `types.model().props().views().actions()`. Async actions use MST `flow()` generators. Store state is persisted to AsyncStorage via `setupRootStore` (key: `root-v1`).

### Consuming Stores in Components

Use the `useStores()` hook (from `app/models/helpers/useStores`). All screens that read store data must be wrapped with MobX `observer()`:

```ts
export const MyScreen: FC = observer(() => {
  const { calibreRootStore, authenticationStore } = useStores()
  // ...
})
```

### API Layer

`app/services/api/api.ts` exports a singleton `api` instance using [apisauce](https://github.com/infinitered/apisauce). API responses return `{ kind: "ok", data }` or `{ kind: <error-type> }` — always check `response.kind === "ok"` before accessing data. The Calibre server URL and Basic Auth token are set at runtime via `api.apisauce.setBaseURL()` and `api.apisauce.setHeader()`.

### Navigation

React Navigation with a native stack in `app/navigators/`. Navigation prop type is `ApppNavigationProp` (note the triple-p). Screens are registered in the navigator; deep linking is configured in `app.config.ts`.

### UI Components

Built on [Gluestack UI](https://gluestack.io/) (`@gluestack-ui/*`). Custom themed components live in `app/components/`. Theme tokens are in `app/theme/`. The app uses `app/theme/gluestack-ui.config.ts` for Gluestack configuration.

### i18n

Use the `translate()` function from `app/i18n/` or the `tx` prop on text components:

```ts
translate("common.ok")
// or
<Text tx="common.ok" />
```

Translation keys are typed (`MessageKey`). Locale files are in `app/i18n/` (en, ko, ar).

## Key Conventions

- **Barrel exports**: Each subdirectory in `app/` has an `index.ts` re-exporting its public API. Import from the directory, not the file.
- **Biome** is the linter/formatter (not ESLint/Prettier). Line width: 100, indent: 2 spaces, no semicolons.
- **Platform-specific code**: Use `.web.tsx` / `.native.tsx` / `.ios.tsx` suffixes for platform variants. Metro and Webpack resolve these automatically.
- **PDF viewing**: Uses `pdfjs-dist` on web and a native viewer on mobile. PDF utilities are in `app/library/`.
- **Reactotron**: MST is wired to Reactotron in development for time-travel debugging. Config is in `app/services/reactotron/`.
- **Storybook**: Stories live alongside components. Run native Storybook by setting `EXPO_PUBLIC_STORYBOOK=true` or via the `storybook:native` script.
- **Electrobun desktop**: `src-electrobun/` contains the Bun/Zig shell. `src-electrobun/main.ts` is the main process entry, `src-electrobun/preload.ts` injects bridge APIs into the webview. Desktop-specific logic should be gated behind `isElectrobun()` from `@/utils/electrobunBridge`.

## Testing & Play Functions

**Play functions are only created when a Storybook story file (`*.stories.tsx`) exists for the component or screen.** If no story file exists, skip play functions and write plain unit tests directly.

### Play Functions

Play functions are pure, reusable action sequences that drive a hook or component into a specific state. They live in a `*StoryPlay.ts` file colocated with the story file.

**Naming**: `play<ScenarioName>({ canvasElement, ...context })` — describe what the scenario sets up or triggers.

**Rules**:
- Accept the Storybook `{ canvasElement: HTMLElement }` context as the first argument (required for story `play:` field compatibility).
- Use DOM queries (`querySelector`, `getByTestId`) to interact with rendered elements.
- Helper utilities go in the same `*StoryPlay.ts` file.
- **Every play function must be called from both**:
  1. The `play:` field of the corresponding story in `*.stories.tsx`
  2. A unit test in `*.story.test.tsx`

**Example** (`app/components/Forms/formInputFieldStoryPlay.ts` + `FormInputField.stories.tsx`):
```ts
// formInputFieldStoryPlay.ts
export async function playFocusShowsSuggestions({ canvasElement }: { canvasElement: HTMLElement }) {
  const input = canvasElement.querySelector("input")!
  input.focus()
  // ... interactions
}
```
```tsx
// FormInputField.stories.tsx
import { playFocusShowsSuggestions } from "./formInputFieldStoryPlay"
export const FocusShowsSuggestions: Story = {
  play: playFocusShowsSuggestions,
}
```
```tsx
// FormInputField.story.test.tsx
import { playFocusShowsSuggestions } from "./formInputFieldStoryPlay"
test("focus shows suggestions", async () => {
  const { container } = render(<FormInputField ... />)
  await playFocusShowsSuggestions({ canvasElement: container })
  expect(...).toBe(...)
})
```

### Unit Tests (no story file)

When there is no `*.stories.tsx` file, write plain unit tests colocated with the implementation. **Hook helper functions (frame schedulers, action sequences, data readers) are defined directly inside the test file** — do not extract them to a separate `*Play.ts` file.

**Rules**:
- Use `bun:test` (`describe`, `test`, `expect`, `jest`, `mock`, `beforeAll`, `beforeEach`).
- Mock all external dependencies with `mock.module(...)` **before** the dynamic `import()` of the subject under test.
- Load the subject lazily inside `beforeAll` using `await import(...)` so mocks take effect.
- Use `renderHook` from `@testing-library/react` for hooks.
- Use `localizeTestRegistrar` from `test/test-name-i18n` to wrap `describe`/`test` for i18n-aware test names.
- Each `test` block asserts one observable outcome (a state change, a mock call, a navigation event, etc.).

**Example** (`app/screens/ViewerScreen/useViewer.test.ts`):
```ts
import { afterAll, beforeAll, beforeEach, describe, expect, jest, mock, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

const useModalMock = jest.fn()
mock.module("@/hooks/useElectrobunModal", () => ({ useElectrobunModal: useModalMock }))

let useViewer: typeof import("./useViewer").useViewer
beforeAll(async () => { ({ useViewer } = await import("./useViewer")) })

describe("useViewer", () => {
  test("resume reading prompt appears after two frames", async () => {
    const { result } = renderHook(() => useViewer(...))
    expect(result.current.showResumePrompt).toBe(true)
  })
})
```

### Checklist for Every Implementation

When Copilot adds or modifies any hook, utility, or component logic, it **must** also:

1. **If a `*.stories.tsx` exists**: Create (or update) a `*StoryPlay.ts` file with at least one play function per meaningful scenario. Each play function **must** be wired to a story's `play:` field **and** called in `*.story.test.tsx`.
2. **If no `*.stories.tsx` exists**: Create (or update) a `*.test.ts` / `*.test.tsx` unit test file with direct assertions.
3. Verify the tests pass with `bun run test:unit`.

