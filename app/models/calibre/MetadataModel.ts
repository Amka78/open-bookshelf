import { type Instance, type SnapshotIn, type SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

export const MetadataModel = types
  .model("MetadataModel")
  .props({
    sharpFixed: types.maybeNull(types.boolean),
    authorSort: types.maybeNull(types.string),
    authors: types.array(types.string),
    formats: types.array(types.string),
    lastModified: types.maybeNull(types.string),
    series: types.maybeNull(types.string),
    seriesIndex: types.maybeNull(types.number),
    size: types.maybeNull(types.number),
    sort: types.maybeNull(types.string),
    tags: types.array(types.string),
    timestamp: types.maybeNull(types.string),
    title: types.maybeNull(types.string),
    uuid: types.maybeNull(types.string),
    selectedFormat: types.maybeNull(types.string),
    rating: types.maybeNull(types.number),
    languages: types.array(types.string),
    langNames: types.map(types.string),
    formatSizes: types.map(types.number),
    cover: types.maybe(types.string),
    publisher: types.maybeNull(types.string),
    pubdate: types.maybeNull(types.string),
    comments: types.maybeNull(types.string),
    /** Calibre identifiers stored as {type: value} e.g. {isbn: "9781234567890"} */
    identifiers: types.map(types.string),
    /**
     * Custom column values keyed by camelCased label (e.g. "#myCustomField").
     * Populated from #-prefixed keys in the Calibre search-result metadata.
     */
    customColumns: types.optional(types.map(types.frozen<unknown>()), {}),
  })
  .actions(withSetPropAction)

export type Metadata = Instance<typeof MetadataModel>
export type MetadataSnapshotIn = SnapshotIn<typeof MetadataModel>
export type MetadataSnapshotOut = SnapshotOut<typeof MetadataModel>
