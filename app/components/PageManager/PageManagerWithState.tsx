import { useState } from "react"
import { PageManager, type PageManagerProps } from "./PageManager"
export type PageManagerWithStateProps = Omit<PageManagerProps, "currentPage"> & {
  initialPage: number
}

export function PageManagerWithState(props: PageManagerWithStateProps) {
  const [page, setPage] = useState(props.initialPage)

  return (
    <PageManager
      {...props}
      currentPage={page}
      onPageChange={(page) => {
        setPage(page)
        if (props.onPageChange) {
          props.onPageChange(page)
        }
      }}
    />
  )
}
