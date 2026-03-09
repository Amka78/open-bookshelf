import { api } from "@/services/api"
import {
  BookModel,
  CategoryModel,
  CategoryTemplateModel,
  ClientSettingModel,
  DateFormatModel,
  FieldMetadataModel,
  IsMultipleModel,
  MetadataModel,
  NodeModel,
  ReadingHistoryModel,
  SearchSettingModel,
  SortFieldModel,
  SubCategoryModel,
} from "./"
import { LibraryMapModel } from "./LibraryMapModel"

describe("Calibre models", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test("Category-related models create and mutate", () => {
    const node = NodeModel.create({ id: 1, avgRating: 4.5, count: 3, name: "node" })
    const template = CategoryTemplateModel.create({
      category: "tags",
      name: "Tag",
      count: 10,
      isCategory: true,
      isSearchable: true,
    })
    const sub = SubCategoryModel.create({
      category: "tags",
      name: "Sub",
      count: 5,
      isCategory: false,
      isSearchable: true,
      children: [],
    })
    sub.setProp("children", [node])

    const category = CategoryModel.create({
      category: template.category,
      name: template.name,
      count: template.count,
      isCategory: template.isCategory,
      isSearchable: template.isSearchable,
      isEditable: true,
      tooltip: "tip",
      subCategory: [],
    })
    category.setProp("subCategory", [sub])

    expect(category.subCategory[0].children[0].name).toBe("node")
  })

  test("Field metadata models create", () => {
    const display = DateFormatModel.create({ dateFormat: "yyyy-MM-dd" })
    const isMultiple = IsMultipleModel.create({
      cacheToList: ",",
      listToUi: ", ",
      uiToList: ",",
    })
    const field = FieldMetadataModel.create({
      categorySort: "name",
      column: null,
      datatype: "text",
      display,
      isCategory: true,
      isCsp: false,
      isCustom: false,
      isEditable: true,
      isMultiple,
      kind: "field",
      label: "Title",
      linkColumn: "title",
      name: "title",
      recIndex: 1,
      searchTerms: ["title"],
      table: "books",
    })

    expect(field.display?.dateFormat).toBe("yyyy-MM-dd")
    expect(field.isMultiple?.cacheToList).toBe(",")
  })

  test("SearchSetting and Metadata can set props", () => {
    const search = SearchSettingModel.create({
      offset: 0,
      query: "",
      sort: "timestamp",
      sortOrder: "desc",
      totalNum: 0,
    })
    search.setProp("query", "new-query")

    const metadata = MetadataModel.create({
      sharpFixed: null,
      authorSort: "author",
      authors: ["a"],
      formats: ["EPUB"],
      lastModified: null,
      series: null,
      seriesIndex: null,
      size: 100,
      sort: "s",
      tags: ["tag"],
      timestamp: null,
      title: "book",
      uuid: "u",
      selectedFormat: null,
      rating: null,
      languages: ["en"],
      langNames: { en: "English" },
      formatSizes: { EPUB: 100 },
      cover: undefined,
    })
    metadata.setProp("selectedFormat", "EPUB")

    expect(search.query).toBe("new-query")
    expect(metadata.selectedFormat).toBe("EPUB")
  })

  test("SortField and ClientSetting create", () => {
    const sortField = SortFieldModel.create({ id: "title", name: "Title" })
    const setting = ClientSettingModel.create({
      id: 1,
      verticalReadingStyle: "singlePage",
      verticalPageDirection: "left",
      horizontalReadingStyle: "facingPage",
      horizontalPageDirection: "right",
    })
    setting.setProp("horizontalReadingStyle", "verticalScroll")

    expect(sortField.id).toBe("title")
    expect(setting.horizontalReadingStyle).toBe("verticalScroll")
  })

  test("ReadingHistory actions work", () => {
    const history = ReadingHistoryModel.create({
      libraryId: "main",
      bookId: 1,
      format: "EPUB",
      currentPage: 0,
      cachedPath: [],
    })

    history.setCurrentPage(5)
    history.setCachePath(["/a.jpg", "/b.jpg"])

    expect(history.currentPage).toBe(5)
    expect(history.cachedPath.slice()).toEqual(["/a.jpg", "/b.jpg"])
  })

  test("BookModel create with minimal snapshot", () => {
    const book = BookModel.create({
      id: 10,
      metaData: null,
      path: [],
      hash: null,
      pageProgressionDirection: null,
    })

    book.setProp("path", ["/page-1.jpg"])
    expect(book.path.slice()).toEqual(["/page-1.jpg"])
  })

  test("LibraryMap setBook and deleteBook actions", async () => {
    const deleteBook = jest.spyOn(api, "deleteBook")
    deleteBook.mockResolvedValue({ kind: "ok" })

    const library = LibraryMapModel.create({
      id: "main",
      books: {
        "10": {
          id: 10,
          metaData: null,
          path: [],
          hash: null,
          pageProgressionDirection: null,
        },
      },
      searchSetting: null,
      sortField: [],
      tagBrowser: [],
      clientSetting: [],
      bookDisplayFields: [],
      fieldMetadataList: {},
      selectedBook: 10,
    })

    library.setBook(10)
    expect(library.selectedBook?.id).toBe(10)

    const result = await library.deleteBook(10)
    expect(result).toBe(true)
    expect(library.selectedBook).toBeUndefined()
    expect(library.books.has("10")).toBe(false)
  })
})
