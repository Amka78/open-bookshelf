import { flow, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import * as xmldom from "xmldom"

import { api } from "../../services/api"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { AuthorModel, EntryModel, LinkModel } from "./"

/**
 * Opds Root Information
 */
export const OpdsRootStore = types
  .model("OpdsRootStore")
  .props({
    author: types.array(AuthorModel),
    id: types.maybeNull(types.string),
    icon: types.maybeNull(types.string),
    updated: types.maybeNull(types.Date),
    link: types.array(LinkModel),
    entry: types.array(EntryModel),
    opensearchTotalResults: types.maybeNull(types.number),
    opensearchItemsPerPage: types.maybeNull(types.number),
    title: types.maybeNull(types.string),
    subtitle: types.maybeNull(types.string),
    lang: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .actions((opds) => ({
    initialize: flow(function* () {
      const response = yield api.connect()
      if (response.kind === "ok") {
        const xmlDom = new xmldom.DOMParser().parseFromString(response.data)

        const feedChildren = xmlDom.getElementsByTagName("feed").item(0).childNodes
        for (let index = 0; index < feedChildren.length; index++) {
          const node = feedChildren.item(index) as Element
          const nodeName = node.nodeName
          if (opds[nodeName] !== undefined) {
            console.log(nodeName)
            if (nodeName === "link") {
              setAttributes(node, opds.link, LinkModel)
            } else if (nodeName === "author") {
              setElements(node, opds.author, AuthorModel)
            } else if (nodeName === "entry") {
              setElements(node, opds.entry, EntryModel)
            } else if (nodeName === "updated") {
              opds[nodeName] = new Date(node.firstChild.nodeValue)
            } else {
              opds[nodeName] = node.firstChild.nodeValue
            }
          }
        }
      }
    }),
  }))

export interface OpdsRoot extends Instance<typeof OpdsRootStore> {}
export interface OpdsRootSnapshotOut extends SnapshotOut<typeof OpdsRootStore> {}
export interface OpdsRootSnapshotIn extends SnapshotIn<typeof OpdsRootStore> {}

function setElements(xmlNode: Element, list, modelRef) {
  const elements = xmlNode.childNodes

  const model = modelRef.create()
  list.push(model)
  for (let i = 0; i < elements.length; i++) {
    const element = elements.item(i) as Element
    const nodeName = element.nodeName
    if (model[nodeName] !== undefined) {
      if (nodeName === "link") {
        setAttributes(element, model[nodeName], LinkModel)
      } else {
        const nodeValue = element.firstChild.nodeValue
        if (nodeName === "updated") {
          model[nodeName] = new Date(nodeValue)
        } else {
          model[nodeName] = nodeValue
        }

        if (element.attributes.length > 0) {
          const attibuteName =
            nodeName +
            element.attributes[0].nodeName[0].toUpperCase() +
            element.attributes[0].nodeName.slice(1)
          if (model[attibuteName] !== undefined) {
            model[attibuteName] = element.attributes[0].nodeValue
          }
        }
      }
    }
  }
}

function setAttributes(xmlNode: Element, list, modelRef) {
  const attributes = xmlNode.attributes

  const model = modelRef.create()
  list.push(model)
  for (let i = 0; i < attributes.length; i++) {
    const nodeName = attributes.item(i).nodeName
    if (model[nodeName] !== undefined) {
      model[nodeName] = attributes.item(i).nodeValue
    }
  }
}
