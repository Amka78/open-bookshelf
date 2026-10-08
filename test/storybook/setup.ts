import * as addonTestAnnotations from "@storybook/experimental-addon-test/preview"
// @storybook/react は import 時に setDefaultProjectAnnotations(INTERNAL_DEFAULT_PROJECT_ANNOTATIONS)
// を呼び、render / renderToCanvas を既定 annotations として登録する。これを compose させないと
// composeStory が SB_PREVIEW_API_0014 (NoRenderFunctionError) になる。
import { setProjectAnnotations } from "@storybook/react"
import previewAnnotations from "../../.storybook/web/preview"

setProjectAnnotations([previewAnnotations, addonTestAnnotations])
