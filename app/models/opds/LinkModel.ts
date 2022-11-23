import { types } from "mobx-state-tree"
import { CopiesModel, IndirectAcquisitionModel, AvailabilityModel } from "./"

export const HoldsModel = types.model("HoldsModel").props({
  total: types.number,
  position: types.number,
})

export const LinkModel = types
  .model("LinkModel")
  .props({
    type: types.maybeNull(types.string),
    rel: types.maybeNull(types.string),
    href: types.maybeNull(types.string),
    title: types.maybeNull(types.string),
    opdsPrice: types.maybeNull(types.number),
    opdsPriceCurrencyCode: types.maybeNull(types.string),
    opdsIndirectAcquisitions: types.array(IndirectAcquisitionModel),
    opdsAvailability: types.maybeNull(AvailabilityModel),
    opdsCopies: types.maybeNull(CopiesModel),
    opdsHolds: types.maybeNull(HoldsModel),
    lcpHashedPassphrase: types.maybeNull(types.string),
    thrCount: types.maybeNull(types.number),
    facetGroup: types.maybeNull(types.string),
  })
  .actions((opds) => ({
    hasRel(): boolean {
      return opds.rel !== null
    },
    setRel(rel: string) {
      opds.rel = rel
    },
  }))
