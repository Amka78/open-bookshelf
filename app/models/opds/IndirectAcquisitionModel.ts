import { types } from "mobx-state-tree"

export type IndirectAcquisition = {
  opdsIndirectAcquisitionType: string
  opdsIndirectAcquisitions: IndirectAcquisition[]
}

export const IndirectAcquisitionModel = types.model("IndirectAcquisitionModel").props({
  opdsIndirectAcquisitionType: types.string,
  opdsIndirectAcquisitions: types.frozen<IndirectAcquisition>(),
})
