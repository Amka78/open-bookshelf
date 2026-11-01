import { CalibreRootContent, RootContainer } from "@/components"
import { useCalibreRoot } from "@/hooks"
import { observer } from "mobx-react-lite"
import React, { type FC } from "react"

export const CalibreRootScreen: FC = observer(() => {
  const { library, onLibraryPress } = useCalibreRoot()

  return (
    <RootContainer>
      <CalibreRootContent libraries={library} onSelect={onLibraryPress} />
    </RootContainer>
  )
})
