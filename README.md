# Open BookShelf

A cross-platform book library management application built with React Native, Expo, and TypeScript. Access and manage your digital book collection seamlessly across iOS, Android, and Web platforms.

## Features

- 📚 **Multi-Platform Support**: Native iOS and Android apps, plus a responsive web version
- 🌐 **Calibre Integration**: Connect to Calibre library servers and manage your book collection
- 🎨 **Beautiful UI**: Modern, responsive design using Gluestack UI components
- 🌍 **Multi-Language Support**: i18n support for multiple languages (English, Korean, Arabic, etc.)
- 🔄 **Hot Reload**: Fast Refresh enabled for rapid development feedback
- 📱 **Responsive Design**: Optimized layouts for tablets and desktops
- 🗂️ **Advanced Search & Filter**: Search books by title, author, category, and tags
- 📖 **PDF Viewer**: Built-in PDF viewer for reading books
- 🎯 **Navigation & Organization**: Intuitive navigation with bottom tab bar and side menu
- 💾 **Persistent Storage**: Async storage for local data persistence
- 🧪 **Testing**: Detox end-to-end tests and Jest unit tests

## Tech Stack

- **Framework**: React Native 0.73 with Expo 50
- **Language**: TypeScript 5
- **State Management**: MobX State Tree
- **Navigation**: React Navigation
- **UI Components**: Gluestack UI, Material Community Icons
- **PDF Handling**: react-native-pdf
- **Forms**: React Hook Form
- **Internationalization**: i18n-js
- **Build Tools**: Metro bundler, Webpack5 for Storybook
- **Testing**: Jest, Detox, Storybook

## Project Structure

```
open-bookshelf
├── app/
│   ├── components/          # Reusable UI components
│   ├── config/              # Environment-specific configurations
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # Translation files and i18n setup
│   ├── library/             # PDF and other library utilities
│   ├── models/              # MobX State Tree models
│   ├── navigators/          # React Navigation configuration
│   ├── screens/             # Screen components
│   ├── services/            # API clients and external services
│   ├── theme/               # Theme configuration
│   ├── type/                # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── app.tsx              # Main app entry point
├── assets/                  # Images and static resources
├── android/                 # Android native code
├── ios/                     # iOS native code
├── .storybook/              # Storybook configuration (Web & Native)
├── test/                    # Test setup and mocks
├── detox/                   # End-to-end tests
├── app.config.ts            # Expo configuration
├── babel.config.js          # Babel configuration with React Refresh
├── metro.config.js          # Metro bundler configuration
├── package.json             # Project dependencies
└── tsconfig.json            # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and Bun
- Expo CLI: `bunx expo --version`
- For iOS: Xcode 15+
- For Android: Android Studio and SDK

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/open-bookshelf.git
cd open-bookshelf

# Install dependencies
bun install

# Optional: Link native dependencies
bun run patch
```

### Development

#### Web Development

```bash
# Start the web development server
bun run expo:web

# Build for production
GITHUB_PAGES=true bun run build:web
```

#### iOS Development

```bash
# Run on iOS simulator
bun run expo:ios

# Or use React Native CLI
bun run ios
```

#### Android Development

```bash
# Run on Android emulator
bun run expo:android

# Or use React Native CLI
bun run android
```

#### Storybook (Component Development)

```bash
# Web Storybook
bun run storybook:web

# Native Storybook (with Expo dev client)
bun run storybook-native
```

## Available Scripts

```
"start": "bunx expo start --dev-client"           // Start development client
"expo:web": "bunx expo start --web"               // Start web development
"expo:ios": "bunx expo start --ios"               // Start iOS simulator
"expo:android": "bunx expo start --android"       // Start Android emulator
"build:web": "bunx expo export --platform web --output-dir dist"  // Build web for production
"test": "jest"                                   // Run unit tests
"test:watch": "jest --watch"                     // Run tests in watch mode
"lint": "eslint app test --fix"                  // Lint and fix code
"compile": "tsc --noEmit"                        // Type check
"storybook:web": "sb dev --config-dir .storybook/web"  // Storybook web
"build-storybook": "build-storybook"             // Build Storybook static
```

## Github Pages Deployment

Deploy the web version to Github Pages:

```bash
# Setup: Configure Github Pages in repository settings
# Branch: gh-pages
# Folder: / (root)

# Automatic deployment on push to main branch
git add .
git commit -m "Deploy to Github Pages"
git push origin main
```

After deployment, access your app at: `https://<your-username>.github.io/open-bookshelf/`

For detailed deployment instructions, see [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md)

## Key Directories Explained

### `app/components`

Reusable UI components built with Gluestack UI:

- `Box`, `VStack`, `HStack` - Layout components
- `Button`, `ButtonGroup` - Button variants
- `Input`, `InputField` - Form inputs
- `Image`, `ImageUploader` - Image handling
- `BookImageItem`, `BookDescriptionItem` - Domain-specific components
- Custom themed components for consistent styling

### `app/models`

MobX State Tree models for application state:

- `RootStore` - Main application store
- `AuthenticationStore` - User authentication state
- `CalibreRootStore` - Calibre library management
- `SettingStore` - Application settings

### `app/screens`

Screen components for different app pages:

- `LibraryScreen` - Book library listing
- `BookDetailScreen` - Individual book details
- `SearchScreen` - Search functionality
- `SettingsScreen` - Application settings

### `app/services`

External service integrations:

- `api` - REST API client with Calibre backend support
- `reactotron` - Development tools integration
- `storage` - Async storage operations

### `app/hooks`

Custom React hooks:

- `useConvergence` - Handle data convergence
- `useOpenViewer` - Open book viewer
- `useDownloadBook` - Download book management
- `useOrientation` - Device orientation handling

## Configuration

### Environment-Specific Config

Configuration files are located in `app/config/`:

- `config.base.ts` - Base configuration
- `config.dev.ts` - Development configuration
- `config.prod.ts` - Production configuration

### Theme

Customize colors, spacing, and typography in `app/theme/`

### Internationalization

Add or modify translations in `app/i18n/`:

- `en.ts` - English
- `ko.ts` - Korean
- `ar.ts` - Arabic

## Testing

### Unit Tests

```bash
bun test
bun run test:watch
```

### End-to-End Tests (Detox)

```bash
bun run build:detox
bun run test:detox
```

See [Detox Setup](./detox/README.md) for detailed instructions.

### Component Testing with Storybook

```bash
bun run storybook:web
```

## Debugging

### Development Features

- **Fast Refresh**: Enabled in web and native development for instant feedback
- **Reactotron**: Redux DevTools-like debugging for MobX State Tree
- **TypeScript**: Full type safety across the codebase

### Console Debugging

```bash
# Start with debugging enabled
bun run start -- --verbose
```

## Platform-Specific Features

### Web

- Responsive design for desktop and tablet
- Service worker support for offline functionality
- Optimized build size with code splitting
- Github Pages deployment ready

### iOS

- Native gesture handling
- Safe area insets support
- iOS-specific navigation patterns

### Android

- Material Design compliance
- Android-specific permissions handling
- Hardware back button support

## Performance Optimization

- **Code Splitting**: Automatic code splitting for web builds
- **Tree Shaking**: Dead code elimination in production builds
- **Metro Transformer**: Optimized JavaScript transformation
- **Hermes Engine**: Lightweight JavaScript engine for faster app startup (iOS/Android)

## Troubleshooting

### Build Issues

```bash
# Clear all caches and rebuild
bun run clean-all
bun install
```

### Metro Cache Issues

```bash
# Clear Metro cache
bun run start -- --reset-cache
```

### Web Build Errors

```bash
# Rebuild with verbose output
GITHUB_PAGES=true bun run build:web -- --verbose
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## Code Style

- **Formatter/Linter**: Biome (configured in `biome.json`)

Run formatting:

```bash
bun run format
```

Run linting:

```bash
bun run lint
```

## License

This project is private and all rights are reserved.

## Support

For issues and questions:

- Check existing [GitHub Issues](https://github.com/yourusername/open-bookshelf/issues)
- Create a new issue for bug reports
- Reference the related documentation

## Changelog

### Latest Updates

- ✅ Fast Refresh enabled for web development
- ✅ Github Pages deployment automation
- ✅ Calibre library integration complete
- ✅ Multi-language support
- ✅ PDF viewer integration
- ✅ Type-safe state management with MobX State Tree

## Related Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [MobX State Tree Docs](https://mobx-state-tree.js.org/)
- [React Navigation Docs](https://reactnavigation.org/)
- [Gluestack UI](https://gluestack.io/)
