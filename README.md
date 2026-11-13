# Shoin

[English](./README.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

Shoin is a cross-platform client for a [Calibre](https://calibre-ebook.com/) book library. Browse, search, edit, and read your books on iOS, Android, and the web.

It talks to a Calibre content server (REST/OPDS) — it does not bundle Calibre itself.

## Features

- **Library browsing** — grid, list, and table views, with sorting, filtering, and a tag browser that shows per-tag counts
- **Search** — server-side search with incremental loading
- **Metadata editing** — edit titles, authors, tags, series, custom columns, and covers, with inline auto-save in the table view
- **Reader** — paginated text viewer for EPUB/AZW3 (horizontal and vertical writing, configurable page direction), PDF viewer, and image-based books such as CBZ
- **Annotations** — highlights and notes for formats that support them
- **Reading history** — reading status and last-read position per book
- **Calibre jobs** — book conversion and OCR (text recognition) review
- **Multi-language UI** — English, Japanese, Korean, and Arabic
- **OTA updates** — JavaScript and asset updates via EAS Update, without rebuilding the app

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Language | TypeScript 7 |
| State | MobX State Tree 5 |
| Navigation | React Navigation 7 (native stack) |
| UI | gluestack-ui 1.x, react-native-svg, expo-image |
| Lists | FlashList 2 |
| Reading | react-native-pdf, react-native-webview (paginated text viewer) |
| i18n | i18n-js |
| Tests | Vitest 3 (jsdom) + Storybook 8 play functions (Chromium via Playwright) |
| Tooling | Bun, Biome, EAS Build / EAS Update |

## Project Structure

```
shoin
├── app/
│   ├── components/     # UI components (each with *.stories.tsx where useful)
│   ├── config/         # Environment-specific configuration
│   ├── hooks/          # Shared hooks (imported via @/hooks)
│   ├── i18n/           # en / ja / ko / ar dictionaries
│   ├── library/        # Reader and pagination logic
│   ├── models/         # MobX State Tree stores
│   ├── navigators/     # Navigation setup
│   ├── screens/        # Connect, Library, Detail, Edit, Viewer, Convert, OCR, ...
│   ├── services/       # Calibre API client, storage, logging
│   ├── theme/          # Colors, spacing, typography
│   ├── type/           # Shared TypeScript types
│   └── utils/
├── assets/             # Icons, splash, images
├── .storybook/         # Storybook for web and native
├── test/               # Vitest setup and mocks
├── scripts/            # Build, version, and EAS helper scripts
├── .github/workflows/  # CI, Docker, GitHub Pages, EAS build/update
├── Dockerfile          # Web build served by nginx
└── app.config.ts       # Expo configuration
```

## Getting Started

### Prerequisites

- Node.js 20+ and [Bun](https://bun.sh/)
- A Calibre content server you can reach from the device
- For local native builds: Android Studio (Android) or Xcode (iOS, macOS only)

iOS and Android release builds are normally produced with EAS Build, so a Mac is not required for Android work.

### Install and run

```bash
git clone git@github.com:Amka78/shoin.git
cd shoin
bun install

bun run start        # Expo Go (JavaScript-only development)
bun run dev:web      # Web development server (with Calibre proxy)
```

Native modules are used by the reader and the viewer, so use a development build for full native testing:

```bash
bun run eas:android:dev   # Build and install a development client
bun run start --dev-client
```

Then open the app, enter your Calibre server URL and credentials, and pick a library.

## Common Commands

```bash
bun run check            # type check + lint + format check + unit + story tests
bun run compile          # tsc --noEmit
bun run lint             # Biome lint
bun run format           # Biome format (write)
bun run test:unit        # Vitest (jsdom)
bun run test:story       # Storybook play tests (Chromium)
bun run build:web        # Export the web build to dist/
bun run version 0.2.0    # Bump app.config.ts + package.json and tag
```

`bun run version` updates both `app.config.ts` and `package.json` and creates the annotated tag; add `--push` to push the commit and tag. See [RELEASE.md](./RELEASE.md) for the full procedure.

### Performance diagnostics

Search timing logs are opt-in. Set `EXPO_PUBLIC_PERF_LOG` to a comma-separated list of modes (`search`, or `all`):

```bash
bun run start --perf              # Expo Go, search timing logs
bun run start --dev-client --perf # development client, search timing logs
bun run dev:web --perf            # web, search timing logs
```

Logs are printed as one-line JSON prefixed with `[PERF]` and share a `performance.now()` clock (`t`). A search emits `menu.press`, `onSearch.start`, `request`, `api.getLibrary`, `converted`, `onSearch.end`, and `menu.done`, so `waitMs` (server + network) and `convertMs` (client-side model conversion) can be compared directly. Nothing is logged unless a mode is requested.

## Testing

- **Unit tests** (`*.test.ts(x)`, Vitest + jsdom) cover models, utility functions, and logic.
- **UI interaction tests** live in Storybook `play` functions (`*.stories.tsx`) and run in a real Chromium via `bun run test:story`. Use these for clicks, pastes, and typing; mock the Calibre API with `api.*` stubs instead of hitting a server.
- CI runs type check, unit tests, and story tests on every push and pull request.

## Docker (Web)

The web build is published as a public image and served over HTTPS by nginx.

```bash
docker run -d \
  --name shoin \
  --restart unless-stopped \
  -p 3000:80 \
  -p 8443:443 \
  -e HTTPS_PORT=8443 \
  -e HTTPS_CN=localhost \
  -v ssl-certs:/etc/nginx/ssl \
  ghcr.io/amka78/shoin:latest
```

Open `https://localhost:8443`. The container generates a self-signed certificate on first start, so the browser will warn once. HTTPS is required because the clipboard API only works in a secure context.

The image also works with Watchtower for automatic updates; `docker-compose.yml` in this repository is the reference setup. See [DOCKER_INSTALL.md](./DOCKER_INSTALL.md) for users and [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) for maintainers.

## Mobile Builds and Releases

- `bun run eas:android:preview` / `bun run eas:ios:preview` — local EAS builds
- `bun run eas:android:prod` / `bun run eas:ios:prod` — production builds
- Pushing a `v*` tag publishes a preview OTA update and the web/Docker artifacts; it does **not** build an APK
- To rebuild the preview APK, run the **Preview APK Build (Manual)** workflow

See [RELEASE.md](./RELEASE.md) for release steps and [EAS_BUILD.md](./EAS_BUILD.md) for build troubleshooting.

## Documentation

- [RELEASE.md](./RELEASE.md) — versioning, tags, OTA, and APK builds
- [EAS_BUILD.md](./EAS_BUILD.md) — EAS build troubleshooting
- [DOCKER_INSTALL.md](./DOCKER_INSTALL.md) — running the web build with Docker
- [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) — deploying and updating the Docker setup
- [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md) — Storybook deployment to GitHub Pages
- [Design.md](./Design.md) — design notes

## License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**. You may use, modify, and redistribute it for any noncommercial purpose, such as personal use, study, hobby projects, research, education, and use by noncommercial organizations.

Commercial use requires a separate commercial license. This includes use in the course of business (including internal business use at a company), incorporation into a commercial product or service, and redistribution for a fee.

The commercial license terms are not finalized yet. For commercial licensing inquiries, please open an issue at [github.com/Amka78/shoin](https://github.com/Amka78/shoin/issues).

See [LICENSE](./LICENSE) for the full license text. Third-party dependencies remain under their own licenses.