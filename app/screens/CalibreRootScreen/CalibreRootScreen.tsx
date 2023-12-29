import { observer } from "mobx-react-lite"
import React, { FC } from "react"

import { CalibreRootScreen as Template } from "./template/CalibreRootScreen"
import { useCalibreRoot } from "./hook/useCalibreRoot"

export const CalibreRootScreen: FC = observer(() => {
  const calibreRootHook = useCalibreRoot()

  return (
    <Template libraries={calibreRootHook.library} onLibraryPress={calibreRootHook.onLibraryPress} />
  )
})
