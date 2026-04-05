/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}

export type ApiBookManifestStatusType = {
  job_id?: number
  job_status: "waiting" | "finished"
  aborted?: boolean
  traceback?: string
}

export type ApiConversionBookData = {
  input_formats: string[]
  output_formats: string[]
  profiles: unknown
  conversion_options: unknown
  title: string
  authors: string[]
  book_id: number
}

export type ApiConversionStart = number

export type ApiConversionStatusRunning = {
  running: true
  percent: number
  msg: string
}

export type ApiConversionStatusFinished = {
  running: false
  ok: boolean
  was_aborted: boolean
  traceback: string
  log: string
  size?: number
  fmt?: string
}

export type ApiConversionStatus = ApiConversionStatusRunning | ApiConversionStatusFinished

type BookManifestChildren = {
  title: string
  dest: string
  flag?: string
  children: BookManifestChildren[]
  id: number
}

type HtmlFileType = {
  mimetype: string
  size: number
  is_virtualized: boolean
  is_html: true
  length: number
  has_maths: boolean
  anchor_map: string[]
}

type ImageFileType = {
  is_virtualized: boolean
  size: number
  mimetype: string
  is_html: false
}

export type MetadataType = {
  formats: string[]
  format_sizes: Record<string, number>
  authors: string[]
  languages: string[]
  publisher: string
  author_sort: string
  last_modified: string
  series: string
  series_index: number
  sort: string
  size: number
  timestamp: string
  title: string
  uuid: string
  lang_names: Record<string, string>
  tags: string[]
  rating: number
  pubdate?: string
  comments?: string
  identifiers?: Record<string, string>
}

/**
 * A single last-read position entry as returned by Calibre's book manifest.
 * Calibre returns one entry per reading device/client.
 */
export type LastReadPosition = {
  device: string
  cfi: string
  pos_frac: number
  epoch: number
}

export type ApiBookManifestResultType = {
  version: number
  toc: {
    title?: string
    dest?: string
    flag?: string
    children: BookManifestChildren[]
  }
  book_format: string
  spine: string[]
  link_uid: string
  book_hash: {
    size: number
    mtime: number
    hash: string
  }
  is_comic: boolean
  raster_cover_name: string
  title_page_name: string
  has_maths: false
  total_length: number
  spine_length: number
  toc_anchor_map: Record<string, string[]>
  landmarks: string[]
  link_to_map: Record<string, Record<string, string[]>>
  page_progression_direction: "rtl" | "ltr"
  files: Record<string, ImageFileType | HtmlFileType>
  metadata: MetadataType
  /** Last-read positions per device. May be a legacy integer array on older servers. */
  last_read_positions: LastReadPosition[] | number[]
  annotations_map: AnnotationsMap
}

export type ApiCalibreInterfaceType = {
  username?: string
  output_format: string
  input_formats: Record<string, boolean>
  gui_pubdata_display_format: string
  gui_timestamp_display_format: string
  gui_last_modified_display_format: string
  completion_mode: string
  use_roman_numerals_for_series_number: boolean
  translations: {
    entiries: Record<string, string[]>
    hash: string
    language: string
    plural_forms: string
  }
  icon_map: {
    authors: string
    series: string
    formats: string
    publisher: string
    rating: string
    news: string
    tags: string
    custom: string
    user: string
    search: string
    identifiers: string
    gst: string
    languages: string
    file_type_icons: {
      default: string
      dir: string
      zero: string
      jpeg: string
      jpg: string
      gif: string
      png: string
      bmp: string
      cbz: string
      cbr: string
      svg: string
      html: string
      htmlz: string
      htm: string
      xhtml: string
      xhtm: string
      lig: string
      lrf: string
      lrx: string
      pdf: string
      pdr: string
      rar: string
      zip: string
      txt: string
      text: string
      prc: string
      azw: string
      mobi: string
      mbp: string
      azw1: string
      azw2: string
      azw3: string
      azw4: string
      tpz: string
      tan: string
      epub: string
      fb2: string
      rtf: string
      odt: string
      snb: string
      djv: string
      djvu: string
      xps: string
      oxps: string
      docx: string
      opml: string
    }
    icon_path: string
  }
  custom_list_template: {
    comments_fields: string[]
    height: string
    line: string[]
    thumbnail: boolean
    thumbnail_height: number
  }
  search_the_net_urls: string[]
  num_per_page: number
  default_book_list_mode: string
  donate_link: string
  lang_code_for_user_manual: string
  library_map: Record<string, string>
  default_library_id: string
  recently_read_by_user: {
    library_id: string
    book_id: number
    format: string
    cfi: string
    epoch: number
    pos_frac: number
    tool_tip: string
  }[]
}

type Children = {
  id: string
  children: Children[]
}

type CategoryItemMap = {
  category: true
  name: string
  is_category: true
  count: number
  tooltip: string
  is_editable: boolean
  is_searchable: boolean
}

type NodeItemMap = {
  category: string
  avg_rating: number
  id: number
  count: number
  name: string
}

export type ApiTagBrowser = {
  root: Children
  item_map: Record<string, CategoryItemMap | NodeItemMap>
}

export type ApiBookFile = {
  version: number
  tree: {
    n: string
    a: []
    c: []
  }
  ns_map: string[]
}

export type ApiBookInfoCore = {
  search_result: {
    total_num: number
    sort_order: "desc" | "asc"
    num_book_without_search: number
    offset: number
    num: number
    sort: string
    base_url: string
    query: string
    library_id: string
    book_ids: number[]
    vl: string
  }
  sortable_fields: string[][]
  metadata: MetadataType[]
}

export type FieldMetadata = {
  category_sort: "sort" | undefined
  column: "name" | null
  datatype: "text" | "int" | "datetime" | "rating" | string
  display:
    | {
        date_format: string
      }
    | undefined
  is_category: boolean
  is_csp: boolean
  is_custom: boolean
  is_editable: boolean
  is_multiple:
    | {
        cache_to_list: unknown
        list_to_ui: unknown
        ui_to_list: unknown
      }
    | undefined
  kind: "field"
  label: string
  link_column: "string" | undefined
  name: string
  rec_index: number
  search_terms: []
  table: CommonFieldName | null
}

export type CommonFieldName =
  | "au_map"
  | "author_sort"
  | "authors"
  | "comments"
  | "cover"
  | "formats"
  | "id"
  | "identifiers"
  | "in_tag_browser"
  | "languages"
  | "last_modified"
  | "marked"
  | "news"
  | "ondevice"
  | "path"
  | "pubdate"
  | "publisher"
  | "rating"
  | "series"
  | "series_index"
  | "series_sort"
  | "size"
  | "sort"
  | "tags"
  | "timestamp"
  | "title"
  | "uuid"

export type ApiBookInfo = {
  book_details_vertical_categories: unknown
  book_display_fields: CommonFieldName[]
  bools_are_tristate: boolean
  field_metadata: Map<CommonFieldName, FieldMetadata>
  virtual_libraries: Record<string, string>
  fts_enabled: boolean
  library_id: string
} & ApiBookInfoCore

export type AnnotationStyle = {
  kind: "color"
  which: string
}

export type CalibreAnnotation = {
  type: "highlight" | "bookmark"
  uuid: string
  spine_index: number
  spine_name: string
  start_cfi?: string
  end_cfi?: string
  highlighted_text?: string
  notes?: string
  style?: AnnotationStyle
  timestamp: string
  title?: string
  pos_frac: number
  removed?: boolean
  annot_id?: number
}

export type AnnotationsMap = {
  highlight?: CalibreAnnotation[]
  bookmark?: CalibreAnnotation[]
}

export type SetBookMetadata = {
  changes: Record<CommonFieldName, unknown>
  loaded_book_ids: Array<number>
}

export type SetBookResult = Map<number, FieldMetadata>

export type CalibreJob = {
  id: number
  name: string
  running: boolean
  percent: number
  status: string | null
  start_time: number
  done: boolean
  failed: boolean
  log?: string
}
