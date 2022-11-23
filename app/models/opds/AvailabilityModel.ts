import { types } from "mobx-state-tree"

export const AvailabilityModel = types.model("AvailabilityModel").props({
  state: types.string,
  status: types.string,
  since: types.Date,
  until: types.Date,
})
