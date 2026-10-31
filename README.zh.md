# Open BookShelf

[English](./README.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

Open BookShelf 是一个面向 [Calibre](https://calibre-ebook.com/) 书库的跨平台客户端。你可以在 iOS、Android 和 Web 上浏览、搜索、编辑和阅读自己的藏书。

它通过 Calibre 内容服务器（REST/OPDS）工作，不包含 Calibre 本体。

## 功能

- **书库浏览** — 网格、列表和表格三种视图，支持排序、筛选，以及显示分类计数的标签浏览器
- **搜索** — 服务端搜索与增量加载
- **元数据编辑** — 编辑标题、作者、标签、系列、自定义列和封面；表格视图支持内联编辑并自动保存
- **阅读器** — EPUB/AZW3 的分页阅读（横排与竖排，可设置翻页方向）、PDF 阅读器，以及 CBZ 等图片型书籍
- **批注** — 在支持的格式上添加高亮和笔记
- **阅读历史** — 每本书的阅读状态和上次阅读位置
- **Calibre 任务** — 书籍转换与 OCR（文字识别）结果确认
- **多语言界面** — 英语、日语、韩语和阿拉伯语
- **OTA 更新** — 通过 EAS Update 更新 JS 和资源，无需重新构建应用

## 技术栈

| 领域 | 技术 |
| --- | --- |
| 框架 | Expo SDK 57、React Native 0.86、React 19 |
| 语言 | TypeScript 7 |
| 状态管理 | MobX State Tree 5 |
| 导航 | React Navigation 7（native stack） |
| UI | gluestack-ui 1.x、react-native-svg、expo-image |
| 列表 | FlashList 2 |
| 阅读 | react-native-pdf、react-native-webview（分页阅读器） |
| 国际化 | i18n-js |
| 测试 | Vitest 3（jsdom）＋ Storybook 8 的 play 函数（通过 Playwright 使用 Chromium） |
| 工具 | Bun、Biome、EAS Build / EAS Update |

## 目录结构

```
open-bookshelf
├── app/
│   ├── components/     # UI 组件（按需放置 *.stories.tsx）
│   ├── config/         # 环境相关配置
│   ├── hooks/          # 共享 hook（通过 @/hooks 导入）
│   ├── i18n/           # en / ja / ko / ar 词典
│   ├── library/        # 阅读器与分页逻辑
│   ├── models/         # MobX State Tree store
│   ├── navigators/     # 导航配置
│   ├── screens/        # 连接、书库、详情、编辑、阅读器、转换、OCR 等
│   ├── services/       # Calibre API 客户端、存储、日志
│   ├── theme/          # 颜色、间距、字体
│   ├── type/           # 共享 TypeScript 类型
│   └── utils/
├── assets/             # 图标、启动图、图片
├── .storybook/         # Web 与 Native 的 Storybook
├── test/               # Vitest 配置与 mock
├── scripts/            # 构建、版本更新、EAS 辅助脚本
├── .github/workflows/  # CI、Docker、GitHub Pages、EAS 构建/更新
├── Dockerfile          # 由 nginx 提供 Web 构建产物
└── app.config.ts       # Expo 配置
```

## 快速开始

### 前置条件

- Node.js 20 及以上，以及 [Bun](https://bun.sh/)
- 可从设备访问的 Calibre 内容服务器
- 本地构建原生应用时需要 Android Studio（Android）或 Xcode（iOS，仅 macOS）

Android/iOS 的发布构建通常使用 EAS Build，因此开发 Android 不需要 Mac。

### 安装与启动

```bash
git clone git@github.com:Amka78/open-bookshelf.git
cd open-bookshelf
bun install

bun run start        # Expo Go（仅 JS 的开发）
bun run expo:web     # Web 开发服务器
```

阅读器使用了原生模块，需要完整验证原生功能时请使用开发构建：

```bash
bun run eas:android:dev   # 构建并安装开发客户端
bun run start:dev-client
```

启动后输入 Calibre 服务器地址和凭据，然后选择书库。

## 常用命令

```bash
bun run check            # 类型检查 + lint + 格式检查 + unit + story 测试
bun run compile          # tsc --noEmit
bun run lint             # Biome lint
bun run format           # Biome format（写入）
bun run test:unit        # Vitest（jsdom）
bun run test:story       # Storybook play 测试（Chromium）
bun run build:web        # 导出 Web 构建到 dist/
bun run version 0.2.0    # 更新 app.config.ts 与 package.json 并创建标签
```

`bun run version` 会同时更新 `app.config.ts` 和 `package.json`，并创建 annotated 标签；加上 `--push` 会推送提交和标签。完整流程见 [RELEASE.md](./RELEASE.md)。

## 测试

- **单元测试**（`*.test.ts(x)`，Vitest + jsdom）覆盖模型、工具函数和逻辑。
- **UI 交互测试**写在 Storybook 的 `play` 函数（`*.stories.tsx`）中，通过 `bun run test:story` 在真实 Chromium 中运行。点击、粘贴和输入请在这里验证；Calibre API 使用 `api.*` 的 stub，不请求真实服务器。
- CI 在每次 push 和 pull request 时运行类型检查、单元测试和 story 测试。

## Docker（Web 版）

Web 构建以公开镜像发布，由 nginx 通过 HTTPS 提供。

```bash
docker run -d \
  --name open-bookshelf \
  --restart unless-stopped \
  -p 3000:80 \
  -p 8443:443 \
  -e HTTPS_PORT=8443 \
  -e HTTPS_CN=localhost \
  -v ssl-certs:/etc/nginx/ssl \
  ghcr.io/amka78/open-bookshelf:latest
```

打开 `https://localhost:8443`。容器首次启动时会生成自签名证书，浏览器会提示一次警告。剪贴板 API 只在安全上下文中可用，因此必须使用 HTTPS。

镜像也支持通过 Watchtower 自动更新，仓库中的 `docker-compose.yml` 是参考配置。使用者请参阅 [DOCKER_INSTALL.md](./DOCKER_INSTALL.md)，维护者请参阅 [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)。

## 移动端构建与发布

- `bun run eas:android:preview` / `bun run eas:ios:preview` — EAS 本地构建
- `bun run eas:android:prod` / `bun run eas:ios:prod` — 生产构建
- 推送 `v*` 标签会发布 preview 的 OTA 更新以及 Web/Docker 产物，**不会**构建 APK
- 需要重新构建 preview APK 时，手动运行 **Preview APK Build (Manual)** 工作流

发布步骤见 [RELEASE.md](./RELEASE.md)，构建问题排查见 [EAS_BUILD.md](./EAS_BUILD.md)。

## 文档

- [RELEASE.md](./RELEASE.md) — 版本更新、标签、OTA 与 APK 构建
- [EAS_BUILD.md](./EAS_BUILD.md) — EAS 构建问题排查
- [DOCKER_INSTALL.md](./DOCKER_INSTALL.md) — 使用 Docker 运行 Web 版
- [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md) — Docker 配置的部署与更新
- [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md) — 将 Storybook 部署到 GitHub Pages
- [Design.md](./Design.md) — 设计笔记

## 许可证

本项目采用 **PolyForm Noncommercial License 1.0.0** 授权。用于任何非商业目的时，你可以自由使用、修改和再分发，例如个人使用、学习、兴趣项目、研究、教育以及非营利组织使用。

商业用途需要单独的商用许可证。这包括在企业业务中使用（含公司内部业务使用）、集成到商业产品或服务中，以及有偿再分发。

商用许可证条款仍在准备中。如有商业授权需求，请在 [github.com/Amka78/open-bookshelf](https://github.com/Amka78/open-bookshelf/issues) 提交 Issue 联系。

完整许可证文本见 [LICENSE](./LICENSE)。第三方依赖仍遵循各自的许可证。