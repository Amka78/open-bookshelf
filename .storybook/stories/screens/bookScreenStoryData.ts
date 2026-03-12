import { RootStoreModel } from "../../../app/models"
import type { RootStore } from "../../../app/models/RootStore"
import type { BookSnapshotIn } from "../../../app/models/calibre"

type FieldMetadataSnapshot = {
  name: string
  datatype: string
  isCategory: boolean
  isCustom: boolean
  isEditable: boolean
  isCsp: boolean
  kind: string
  label: string
  searchTerms: string[]
  display?: {
    dateFormat: string
  }
  linkColumn?: string
  isMultiple?: {
    listToUi: string
    cacheToList: string
    uiToList: string
  }
}

type TagBrowserSnapshot = {
  category: string
  name: string
  isCategory?: boolean
  count: number
  isSearchable?: boolean
  isEditable: boolean
  tooltip?: string
  subCategory: Array<{
    category: string
    name: string
    isCategory?: boolean
    count: number
    isSearchable?: boolean
    children: Array<{
      id: number
      avgRating: number
      count: number
      name: string
    }>
  }>
}

const sampleBook: BookSnapshotIn = {
  id: 12345,
  metaData: {
    sharpFixed: null,
    authorSort: "bookAuthor 1 & bookAuthor 2",
    authors: ["bookAuthor 1", "bookAuthor 2"],
    formats: ["EPUB", "PDF"],
    lastModified: "2023-12-18T18:25:04+00:00",
    series: "Book Series",
    seriesIndex: 1,
    size: 100000,
    sort: "Book Title",
    tags: ["Fiction", "Adventure"],
    timestamp: "2023-12-10T08:00:00+00:00",
    title: "Book Title",
    uuid: "sample-uuid",
    selectedFormat: "EPUB",
    rating: 8,
    languages: ["en", "ja"],
    langNames: {
      en: "English",
      ja: "Japanese",
    },
    formatSizes: {
      EPUB: 123456,
      PDF: 234567,
    },
  },
}

const sampleFieldMetadataList: Record<string, FieldMetadataSnapshot> = {
  title: {
    name: "Title",
    datatype: "text",
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "title",
    searchTerms: ["title"],
  },
  authors: {
    name: "Author",
    datatype: "text",
    isMultiple: {
      listToUi: " & ",
      cacheToList: "&",
      uiToList: "&",
    },
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "authors",
    searchTerms: ["authors"],
  },
  authorSort: {
    name: "Author Sort",
    datatype: "text",
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "authorSort",
    searchTerms: ["author_sort"],
  },
  sort: {
    name: "Title Sort",
    datatype: "text",
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "sort",
    searchTerms: ["sort"],
  },
  lastModified: {
    name: "Last Modified",
    datatype: "datetime",
    display: {
      dateFormat: "yyyy MM dd",
    },
    isCategory: false,
    isCustom: false,
    isEditable: false,
    isCsp: false,
    kind: "field",
    label: "lastModified",
    searchTerms: ["last_modified"],
  },
  formats: {
    name: "Formats",
    datatype: "text",
    isMultiple: {
      listToUi: ", ",
      cacheToList: ",",
      uiToList: ",",
    },
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "formats",
    searchTerms: ["formats"],
  },
  rating: {
    name: "Rating",
    datatype: "rating",
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "rating",
    searchTerms: ["rating"],
  },
  size: {
    name: "Size",
    datatype: "float",
    isCategory: false,
    isCustom: false,
    isEditable: false,
    isCsp: false,
    kind: "field",
    label: "size",
    searchTerms: ["size"],
  },
  series: {
    name: "Series",
    datatype: "text",
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "series",
    searchTerms: ["series"],
  },
  tags: {
    name: "Tags",
    datatype: "text",
    isMultiple: {
      listToUi: ", ",
      cacheToList: ",",
      uiToList: ",",
    },
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "tags",
    searchTerms: ["tags"],
  },
  languages: {
    name: "Languages",
    datatype: "text",
    linkColumn: "lang_code",
    isMultiple: {
      listToUi: ", ",
      cacheToList: ",",
      uiToList: ",",
    },
    isCategory: false,
    isCustom: false,
    isEditable: true,
    isCsp: false,
    kind: "field",
    label: "languages",
    searchTerms: ["languages"],
  },
}

const sampleTagBrowser: TagBrowserSnapshot[] = [
  {
    category: "authors",
    name: "Authors",
    count: 2,
    isEditable: true,
    isSearchable: true,
    subCategory: [
      {
        category: "authors",
        name: "Authors",
        count: 2,
        isSearchable: true,
        children: [
          { id: 1, avgRating: 4.5, count: 1, name: "bookAuthor 1" },
          { id: 2, avgRating: 4.0, count: 1, name: "bookAuthor 2" },
        ],
      },
    ],
  },
  {
    category: "tags",
    name: "Tags",
    count: 2,
    isEditable: true,
    isSearchable: true,
    subCategory: [
      {
        category: "tags",
        name: "Tags",
        count: 2,
        isSearchable: true,
        children: [
          { id: 10, avgRating: 4.2, count: 1, name: "Fiction" },
          { id: 11, avgRating: 4.1, count: 1, name: "Adventure" },
        ],
      },
    ],
  },
  {
    category: "series",
    name: "Series",
    count: 1,
    isEditable: true,
    isSearchable: true,
    subCategory: [
      {
        category: "series",
        name: "Series",
        count: 1,
        isSearchable: true,
        children: [{ id: 20, avgRating: 4.6, count: 1, name: "Book Series" }],
      },
    ],
  },
]

const sampleFieldNameList = [
  "lastModified",
  "formats",
  "rating",
  "size",
  "authors",
  "authorSort",
  "series",
  "languages",
  "tags",
]

export function createBookScreenRootStore(): RootStore {
  const bookId = String(sampleBook.id)

  return RootStoreModel.create({
    authenticationStore: {
      token: "dXNlcjpwYXNz",
      userId: "user",
      password: "pass",
    },
    calibreRootStore: {
      defaultLibraryId: "library-1",
      numPerPage: 20,
      libraryMap: {
        "library-1": {
          id: "library-1",
          books: {
            [bookId]: sampleBook,
          },
          searchSetting: {
            offset: 0,
            query: "",
            sort: "title",
            sortOrder: "asc",
            totalNum: 1,
            vl: null,
          },
          sortField: [
            { id: "title", name: "Title" },
            { id: "authors", name: "Author" },
          ],
          tagBrowser: sampleTagBrowser,
          clientSetting: [],
          bookDisplayFields: sampleFieldNameList,
          fieldMetadataList: sampleFieldMetadataList,
          selectedBook: Number(bookId),
          virtualLibraries: [],
        },
      },
      selectedLibrary: "library-1",
      readingHistories: [],
    },
  })
}
