import { useConvergence } from "@/hooks/useConvergence";
import { useStores } from "@/models";
import type { ApppNavigationProp } from "@/navigators";
import { api } from "@/services/api";
import { logger } from "@/utils/logger";
import { useNavigation } from "@react-navigation/native";
import type { DocumentPickerAsset } from "expo-document-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
export type LibraryViewStyle = "gridView" | "viewList";
export function useLibrary() {
  const { calibreRootStore } = useStores();
  const navigation = useNavigation<ApppNavigationProp>();
  const selectedLibrary = calibreRootStore.selectedLibrary;

  const [searching, setSearching] = useState(false);
  const [mobileViewStyle, setMovileViewStyle] =
    useState<LibraryViewStyle>("viewList");
  const [desktopViewStyle, setDesktopViewStyle] =
    useState<LibraryViewStyle>("gridView");
  const [headerSearchText, setHeaderSearchText] = useState(
    selectedLibrary?.searchSetting?.query ?? "",
  );

  const convergenceHook = useConvergence();

  const books = undefined;

  const searchParameterCandidates = useMemo(() => {
    if (!selectedLibrary) {
      return [] as string[]
    }

    const terms = Array.from(selectedLibrary.fieldMetadataList.values())
      .flatMap((metadata) => metadata.searchTerms.slice())
      .filter((term) => term && term !== "all")

    return Array.from(new Set(terms))
  }, [selectedLibrary])

  const completeSearchParameter = useCallback(
    (text: string) => {
      const lastSpaceIndex = text.lastIndexOf(" ")
      const prefixText = lastSpaceIndex >= 0 ? text.slice(0, lastSpaceIndex + 1) : ""
      const token = lastSpaceIndex >= 0 ? text.slice(lastSpaceIndex + 1) : text

      if (!token.endsWith(":")) {
        return text
      }

      const rawParameter = token.slice(0, -1).toLowerCase()
      if (!rawParameter) {
        return text
      }

      const matches = searchParameterCandidates.filter((candidate) => {
        return candidate.toLowerCase().startsWith(rawParameter)
      })

      if (matches.length !== 1) {
        return text
      }

      return `${prefixText}${matches[0]}:=`
    },
    [searchParameterCandidates],
  )
  const search = async () => {
    setSearching(true);
    try {
      await calibreRootStore.searchLibrary();
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    setHeaderSearchText(selectedLibrary?.searchSetting?.query ?? "")
  }, [selectedLibrary?.searchSetting?.query])

  useEffect(() => {
    search();

    calibreRootStore.getTagBrowser();
  }, []);

  const onSearch = async (searchCondition?: string) => {
    selectedLibrary.searchSetting.setProp("query", searchCondition ?? "");
    await search();
  };

  const onSort = (sortKey: string) => {
    if (sortKey === selectedLibrary.searchSetting?.sort) {
      selectedLibrary.searchSetting.setProp(
        "sortOrder",
        selectedLibrary.searchSetting.sortOrder === "desc" ? "asc" : "desc",
      );
    } else {
      selectedLibrary.searchSetting.setProp("sort", sortKey);
      selectedLibrary.searchSetting.setProp("sortOrder", "desc");
    }
    search();
  };

  const onChangeListStyle = () => {
    setSearching(true);
    if (convergenceHook.isLarge) {
      setDesktopViewStyle(
        desktopViewStyle === "gridView" ? "viewList" : "gridView",
      );
    } else {
      setMovileViewStyle(
        mobileViewStyle === "gridView" ? "viewList" : "gridView",
      );
    }
    setSearching(false);
  };

  const onUploadFile = async (assets: DocumentPickerAsset[]) => {
    setSearching(true);

    logger.debug("onUploadFile", assets);

    try {
      await api.uploadFile(
        assets[0].name,
        selectedLibrary.id,
        assets[0].file ?? assets[0].uri,
      );
      await onSearch();
    } finally {
      setSearching(false);
    }
  };

  const currentListStyle = convergenceHook.isLarge
    ? desktopViewStyle
    : mobileViewStyle;

  return {
    currentListStyle,
    onChangeListStyle,
    onUploadFile,
    onSearch,
    onSort,
    searching,
    mobileViewStyle,
    desktopViewStyle,
    headerSearchText,
    setHeaderSearchText,
    searchParameterCandidates,
    completeSearchParameter,
  };
}
