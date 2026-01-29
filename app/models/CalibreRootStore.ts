import {
  type Instance,
  type SnapshotIn,
  type SnapshotOut,
  flow,
  types,
} from "mobx-state-tree";

import {
  type ApiBookInfo,
  type ApiBookInfoCore,
  api,
  ApiCalibreInterfaceType,
} from "../services/api";
import {
  CategoryModel,
  DateFormatModel,
  FieldMetadataModel,
  IsMultipleModel,
  MetadataModel,
  NodeModel,
  SearchSettingModel,
  SortFieldModel,
  SubCategoryModel,
  LibraryMapModel,
  type LibraryMap,
  ReadingHistoryModel,
} from "./calibre";
import { handleCommonApiError } from "./errors/errors";
import { withSetPropAction } from "./helpers/withSetPropAction";
import { lowerCaseToCamelCase } from "@/utils/convert";

/**
 * Calibre Root Information
 */
export const CalibreRootStore = types
  .model("CalibreRootStore")
  .props({
    defaultLibraryId: types.maybeNull(types.string),
    numPerPage: types.maybeNull(types.number),
    libraryMap: types.map(LibraryMapModel),
    selectedLibrary: types.maybe(
      types.reference(types.late(() => LibraryMapModel)),
    ),
    readingHistories: types.array(ReadingHistoryModel),
  })
  .actions(withSetPropAction)
  .actions((root) => ({
    initialize: flow(function* () {
      const response = yield api.initializeCalibre();
      if (response.kind === "ok") {
        const data: ApiCalibreInterfaceType = response.data;
        root.defaultLibraryId = data.default_library_id;
        root.numPerPage = data.num_per_page;

        root.libraryMap.clear();
        Object.keys(data.library_map).forEach((keyName: string) => {
          root.libraryMap.set(keyName, { id: keyName });
        });

        data.recently_read_by_user?.forEach((readingInfo) => {
          let readingHistory = root.readingHistories.find((readingHistory) => {
            return (
              readingHistory.libraryId === readingInfo.library_id &&
              readingHistory.bookId === readingInfo.book_id &&
              readingHistory.format === readingInfo.format
            );
          });
          if (readingHistory) {
          } else {
            readingHistory = ReadingHistoryModel.create({
              bookId: readingInfo.book_id,
              currentPage: 0,
              libraryId: readingInfo.library_id,
              format: readingInfo.format,
            });
          }
        });
        return true;
      }
      handleCommonApiError(response);
      return false;
    }),
    getTagBrowser: flow(function* () {
      const response = yield api.getTagBrowser(root.defaultLibraryId);
      if (response.kind === "ok") {
        root.selectedLibrary.tagBrowser.clear();

        Object.values(response.data.root.children).forEach(
          (value: { id; children: { id; children }[] }) => {
            const category = response.data.item_map[value.id];

            const categoryModel = CategoryModel.create({
              category: category.category,
              count: category.count,
              isCategory: category.is_category,
              isEditable: category.is_editable,
              isSearchable: category.is_searchable,
              name: category.name,
              tooltip: category.tooltip,
            });

            const subCategoryArray = [];
            Object.values(value.children).forEach((subValue) => {
              const subCateogy = response.data.item_map[subValue.id];
              const subCategoryModel = SubCategoryModel.create({
                category: subCateogy.category,
                count: subCateogy.count,
                isCategory: subCateogy.is_category,
                isSearchable: subCateogy.is_searchable,
                name: subCateogy.name,
              });

              const nodeArray = [];
              Object.values(subValue.children).forEach((nodeValue: { id }) => {
                const node = response.data.item_map[nodeValue.id];

                const nodeModel = NodeModel.create({
                  avgRating: node.avg_rating,
                  count: node.count,
                  id: node.id,
                  name: node.name,
                });

                nodeArray.push(nodeModel);
              });
              subCategoryModel.setProp("children", nodeArray);
              subCategoryArray.push(subCategoryModel);
            });

            categoryModel.setProp("subCategory", subCategoryArray);
            root.selectedLibrary.tagBrowser.push(categoryModel);
          },
        );
        return true;
      }
      handleCommonApiError(response);
      return false;
    }),
    searchLibrary: flow(function* () {
      const response = yield api.getLibrary(
        root.selectedLibrary.id,
        root.selectedLibrary.searchSetting
          ? root.selectedLibrary.searchSetting.query
          : "",
        root.selectedLibrary.searchSetting
          ? root.selectedLibrary.searchSetting.sort
          : "timestamp",
        root.selectedLibrary.searchSetting
          ? root.selectedLibrary.searchSetting.sortOrder
          : "desc",
      );

      if (response.kind === "ok") {
        root.selectedLibrary.books.clear();
        convertLibraryInformation(response.data, root.selectedLibrary);
        convertSearchResult(response.data, root.selectedLibrary);

        return true;
      }
      handleCommonApiError(response);
      return false;
    }),
    searchMoreLibrary: flow(function* () {
      const selectedLibrary = root.selectedLibrary;
      const response = yield api.getMoreLibrary(root.selectedLibrary.id, {
        offset: selectedLibrary.searchSetting.offset,
        query: selectedLibrary.searchSetting.query
          ? selectedLibrary.searchSetting.query
          : "",
        sort: selectedLibrary.searchSetting.sort,
        sort_order: selectedLibrary.searchSetting.sortOrder,
        vl: "",
      });

      if (response.kind === "ok") {
        convertSearchResult(response.data, selectedLibrary);
        return true;
      }
      handleCommonApiError(response);
      return false;
    }),
    setLibrary: (libraryId?: string) => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      root.selectedLibrary = libraryId as any;
    },
  }));

export type CalibreRoot = Instance<typeof CalibreRootStore>;
export type CalibreRootSnapshotOut = SnapshotOut<typeof CalibreRootStore>;
export type CalibreRootSnapshotIn = SnapshotIn<typeof CalibreRootStore>;

function convertSearchResult(
  data: ApiBookInfoCore,
  selectedLibrary: LibraryMap,
) {
  selectedLibrary.searchSetting = SearchSettingModel.create({
    offset: data.search_result.num + data.search_result.offset,
    query: data.search_result.query ? data.search_result.query : "",
    sort: data.search_result.sort,
    sortOrder: data.search_result.sort_order,
    totalNum: data.search_result.total_num
      ? data.search_result.total_num
      : selectedLibrary.searchSetting.totalNum,
  });
  data.search_result.book_ids.forEach((bookId: number) => {
    const metadata = data.metadata[bookId];

    const metaDataModel = MetadataModel.create({
      authors: metadata.authors,
      authorSort: metadata.author_sort,
      formats: metadata.formats,
      lastModified: metadata.last_modified,
      seriesIndex: metadata.series_index,
      sharpFixed: metadata["#fixed"],
      size: metadata.size,
      sort: metadata.sort,
      tags: metadata.tags,
      timestamp: metadata.timestamp,
      title: metadata.title,
      uuid: metadata.uuid,
      rating: metadata.rating,
      languages: metadata.languages,
      langNames: metadata.lang_names,
      formatSizes: metadata.format_sizes,
    });

    selectedLibrary.books.set(bookId.toString(), {
      id: bookId,
      metaData: metaDataModel as unknown,
    });
  });

  if (data.sortable_fields) {
    selectedLibrary.sortField.clear();
    data.sortable_fields.forEach((value) => {
      const sortField = SortFieldModel.create({
        id: value[0],
        name: value[1],
      });

      selectedLibrary.sortField.push(sortField);
    });
  }
}

function convertLibraryInformation(
  bookInfo: ApiBookInfo,
  libraryInfo: LibraryMap,
) {
  libraryInfo.bookDisplayFields.clear();
  libraryInfo.fieldMetadataList.clear();
  bookInfo.book_display_fields.forEach((value) => {
    libraryInfo.bookDisplayFields.push(value);
  });

  Object.keys(bookInfo.field_metadata).forEach((key) => {
    let display = undefined;
    if (bookInfo.field_metadata[key].display.date_format) {
      display = DateFormatModel.create({
        dateFormat: bookInfo.field_metadata[key].display.date_format,
      });
    }
    let isMultiple;
    if (bookInfo.field_metadata[key].is_multiple.cache_to_list) {
      isMultiple = IsMultipleModel.create({
        cacheToList: bookInfo.field_metadata[key].is_multiple.cache_to_list,
        listToUi: bookInfo.field_metadata[key].is_multiple.list_to_ui,
        uiToList: bookInfo.field_metadata[key].is_multiple.ui_to_list,
      });
    }
    const fieldMetadata = FieldMetadataModel.create({
      categorySort: bookInfo.field_metadata[key].category_sort,
      column: bookInfo.field_metadata[key].column,
      datatype: bookInfo.field_metadata[key].datatype,
      display: display,
      isMultiple: isMultiple,
      isCategory: bookInfo.field_metadata[key].is_category,
      isCsp: bookInfo.field_metadata[key].is_csp,
      isCustom: bookInfo.field_metadata[key].is_custom,
      isEditable: bookInfo.field_metadata[key].is_editable,
      kind: bookInfo.field_metadata[key].kind,
      label: lowerCaseToCamelCase(bookInfo.field_metadata[key].label),
      linkColumn: bookInfo.field_metadata[key].link_column,
      name: bookInfo.field_metadata[key].name,
      recIndex: bookInfo.field_metadata[key].rec_index,
      searchTerms: bookInfo.field_metadata[key].search_terms,
      table: bookInfo.field_metadata[key].table,
    });
    libraryInfo.fieldMetadataList.set(lowerCaseToCamelCase(key), fieldMetadata);
  });
}
