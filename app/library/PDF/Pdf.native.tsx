import type { ComponentProps } from "react"

import Origin from "react-native-pdf"

export type PDFProps = ComponentProps<typeof Origin>

export function PDF(props: PDFProps) {
  return <Origin {...props} />
}
