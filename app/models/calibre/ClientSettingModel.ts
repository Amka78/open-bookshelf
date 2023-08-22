import { Instance, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

const PageDirectionType = types.union(types.literal("left"), types.literal("right"))

export const BookReadingStyleType = types.union(
  types.literal("singlePage"),
  types.literal("facingPage"),
  types.literal("facingPageWithTitle"),
  types.literal("verticalScroll"),
)

export const ClientSettingModel = types
  .model("ClientSettingModel")
  .props({
    id: types.identifierNumber,
    verticalReadingStyle: BookReadingStyleType,
    verticalPageDirection: PageDirectionType,
    horizontalReadingStyle: BookReadingStyleType,
    horizontalPageDirection: PageDirectionType,
  })
  .actions(withSetPropAction)
export interface ClientSetting extends Instance<typeof ClientSettingModel> {}
