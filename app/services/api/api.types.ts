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

export type ApiBookManifestType = {
  job_id?: number
  job_status: "waiting" | "finished"
  aborted?: boolean
  traceback?: string
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
