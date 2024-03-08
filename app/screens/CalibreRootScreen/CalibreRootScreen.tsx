import { observer } from "mobx-react-lite"
import React, { type FC } from "react"

import { useCalibreRoot } from "./hook/useCalibreRoot"
import { CalibreRootScreen as Template } from "./template/CalibreRootScreen"

export const CalibreRootScreen: FC = observer(() => {
  const calibreRootHook = useCalibreRoot()

  return (
    <Template libraries={calibreRootHook.library} onLibraryPress={calibreRootHook.onLibraryPress} />
  )
})
