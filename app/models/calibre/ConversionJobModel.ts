import { type Instance, type SnapshotIn, type SnapshotOut, types } from "mobx-state-tree"

import { withSetPropAction } from "../helpers/withSetPropAction"

export const ConversionJobStatusModel = types.enumeration("ConversionJobStatus", [
  "running",
  "done",
  "failed",
  "aborted",
])

export const ConversionJobModel = types
  .model("ConversionJobModel")
  .props({
    id: types.identifier,
    jobId: types.number,
    libraryId: types.string,
    bookId: types.number,
    bookTitle: types.string,
    inputFormat: types.string,
    outputFormat: types.string,
    status: types.optional(ConversionJobStatusModel, "running"),
    percent: types.optional(types.number, 0),
    message: types.maybeNull(types.string),
    log: types.maybeNull(types.string),
    traceback: types.maybeNull(types.string),
    size: types.maybeNull(types.number),
    format: types.maybeNull(types.string),
    createdAt: types.number,
    updatedAt: types.number,
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    markRunning(percent: number, message: string | null = null) {
      self.setProp("status", "running")
      self.setProp("percent", percent)
      self.setProp("message", message)
      self.setProp("updatedAt", Date.now())
    },
    markDone(format: string | null = null, size: number | null = null) {
      self.setProp("status", "done")
      self.setProp("percent", 1)
      self.setProp("message", null)
      self.setProp("traceback", null)
      self.setProp("log", null)
      self.setProp("format", format)
      self.setProp("size", size)
      self.setProp("updatedAt", Date.now())
    },
    markFailed(traceback: string | null = null, log: string | null = null) {
      self.setProp("status", "failed")
      self.setProp("message", null)
      self.setProp("traceback", traceback)
      self.setProp("log", log)
      self.setProp("updatedAt", Date.now())
    },
    markAborted(traceback: string | null = null, log: string | null = null) {
      self.setProp("status", "aborted")
      self.setProp("message", null)
      self.setProp("traceback", traceback)
      self.setProp("log", log)
      self.setProp("updatedAt", Date.now())
    },
  }))

export type ConversionJob = Instance<typeof ConversionJobModel>
export type ConversionJobSnapshotOut = SnapshotOut<typeof ConversionJobModel>
export type ConversionJobSnapshotIn = SnapshotIn<typeof ConversionJobModel>
