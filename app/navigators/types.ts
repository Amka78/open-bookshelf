import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack"

import type { Link } from "../models/opds"

export type AppStackParamList = {
  Welcome: undefined
  Connect: undefined
  OPDSRoot: undefined
  CalibreRoot: undefined
  Library: undefined
  Acquisition: {
    link: Link
  }
  Viewer: undefined
  PDFViewer: undefined
  BookDetail: {
    imageUrl: string
    onLinkPress: (query: string) => void
    onOpenBookAction?: () => void | Promise<void>
    onDownloadBookAction?: () => void | Promise<void>
    onDeleteBookAction?: () => void | Promise<void>
    onNavigateToBookConvert?: (params: { imageUrl: string }) => void
    onNavigateToBookEdit?: (params: { imageUrl: string }) => void
  }
  BookEdit: {
    imageUrl: string
  }
  BookConvert: {
    imageUrl: string
  }
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type ApppNavigationProp = NativeStackNavigationProp<AppStackParamList>
