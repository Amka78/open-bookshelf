import { flow, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import * as xmldom from "xmldom"

import { api } from "@/services/api"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { AuthorModel, EntryModel, LinkModel } from "./"

/**
 * Opds Root Information
 */
export const OpdsModel = types
  .model("OpdsModel")
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
    reset: () => {
      opds.author.clear()
      opds.entry.clear()
      opds.link.clear()
    },
  }))
  .actions((opds) => ({
    load: flow(function* (path?: string, initialize = true) {
      const response = yield api.loadOPDS(path)
      if (response.kind === "ok") {
        if (initialize) {
          opds.reset()
        }
        const xmlDom = new xmldom.DOMParser().parseFromString(response.data)

        const feedChildren = xmlDom.getElementsByTagName("feed").item(0).childNodes
        for (let index = 0; index < feedChildren.length; index++) {
          const node = feedChildren.item(index) as Element
          const nodeName = node.nodeName
          if (opds[nodeName] !== undefined) {
            setState(nodeName, node, opds)
          }
        }
      }
    }),
  }))

export interface OpdsRoot extends Instance<typeof OpdsModel> {}
export interface OpdsRootSnapshotOut extends SnapshotOut<typeof OpdsModel> {}
export interface OpdsRootSnapshotIn extends SnapshotIn<typeof OpdsModel> {}

function setState(nodeName: string, node: Element, opds) {
  if (nodeName === "link") {
    setAttributes(node, opds.link, LinkModel)
  } else if (nodeName === "author") {
    setElements(node, opds.author, AuthorModel)
  } else if (nodeName === "entry") {
    setElements(node, opds.entry, EntryModel)
  } else if (nodeName === "updated" || nodeName === "published") {
    opds[nodeName] = new Date(node.firstChild.nodeValue)
  } else {
    opds[nodeName] = node.firstChild.nodeValue
  }

  if (node.attributes.length > 0) {
    const attibuteName =
      nodeName + node.attributes[0].nodeName[0].toUpperCase() + node.attributes[0].nodeName.slice(1)
    if (opds[attibuteName] !== undefined) {
      opds[attibuteName] = node.attributes[0].nodeValue
    }
  }
}

function setElements(xmlNode: Element, list, modelRef) {
  const elements = xmlNode.childNodes

  const model = modelRef.create()
  list.push(model)
  for (let i = 0; i < elements.length; i++) {
    const element = elements.item(i) as Element
    const nodeName = element.nodeName
    if (model[nodeName] !== undefined) {
      setState(nodeName, element, model)
    }
  }
}

export const OpdsChildrenModel = types.model("OpdsChildrenModel").props({
  linkPath: types.maybeNull(types.string),
  opds: types.maybeNull(OpdsModel),
})

export interface OpdsChildren extends Instance<typeof OpdsChildrenModel> {}
export const OpdsRootStore = types
  .model("OpdsRootStre")
  .props({
    root: types.optional(OpdsModel, {}),
    children: types.array(OpdsChildrenModel),
  })
  .actions((self) => ({
    add: (child: OpdsChildren) => {
      self.children.push(child)
    },
  }))

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
