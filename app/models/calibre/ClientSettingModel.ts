import { Instance, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

const PageDirectionLiterals = types.union(types.literal("left"), types.literal("right"))

export const BookReadingStyleLiterals = types.union(
  types.literal("singlePage"),
  types.literal("facingPage"),
  types.literal("facingPageWithTitle"),
  types.literal("verticalScroll"),
)

export const ClientSettingModel = types
  .model("ClientSettingModel")
  .props({
    id: types.identifierNumber,
    verticalReadingStyle: BookReadingStyleLiterals,
    verticalPageDirection: PageDirectionLiterals,
    horizontalReadingStyle: BookReadingStyleLiterals,
    horizontalPageDirection: PageDirectionLiterals,
  })
  .actions(withSetPropAction)
export type ClientSetting = Instance<typeof ClientSettingModel>
