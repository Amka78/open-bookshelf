import { type Instance, types } from "mobx-state-tree"

export const AnnotationModel = types
  .model("AnnotationModel")
  .props({
    uuid: types.identifier,
    type: types.union(types.literal("highlight"), types.literal("bookmark")),
    spineIndex: types.number,
    spineName: types.string,
    startCfi: types.maybeNull(types.string),
    endCfi: types.maybeNull(types.string),
    highlightedText: types.maybeNull(types.string),
    notes: types.maybeNull(types.string),
    styleKind: types.maybeNull(types.string),
    styleWhich: types.maybeNull(types.string),
    timestamp: types.string,
    title: types.maybeNull(types.string),
    posFrac: types.number,
  })
  .actions((self) => ({
    setNotes(notes: string | null) {
      self.notes = notes
    },
    setTitle(title: string | null) {
      self.title = title
    },
  }))

export type Annotation = Instance<typeof AnnotationModel>
