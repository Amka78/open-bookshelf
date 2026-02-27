# Copilot Instructions

## Project Overview

Open BookShelf is a cross-platform digital book library manager built with React Native + Expo. It integrates with [Calibre](https://calibre-ebook.com/) servers and OPDS catalogs to browse, manage, and read ebooks. It targets iOS, Android, Web, and Desktop (via Tauri).

## Commands

```bash
bun run start              # Start Expo dev client
bun run expo:ios           # iOS simulator
bun run expo:android       # Android emulator
bun run expo:web           # Web dev server
bun run desktop            # Tauri desktop dev

bun run lint               # Biome lint
bun run format             # Biome format
bun run compile            # TypeScript type check

bun run test               # All Jest unit tests
bun run test -- --testPathPattern="ModelName"  # Single test file
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
- **Tauri desktop**: `src-tauri/` contains the Rust shell. Desktop-specific logic should be gated behind platform checks.
