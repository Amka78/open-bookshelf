/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import Config from "@/config"
import { ApiResponse, ApisauceInstance, create } from "apisauce"

import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import * as FileSystem from "expo-file-system"

import type {
  ApiConfig,
  ApiFeedResponse,
  ApiBookManifestStatusType,
  ApiCalibreInterfaceType,
  ApiTagBrowser,
  ApiBookFile,
  ApiBookManifestResultType,
  ApiBookInfoCore,
  ApiBookInfo,
} from "./api.types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  authenticaion: Record<string, string>

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: "",
      timeout: this.config.timeout,
      headers: {
        Accept: "application/atom+xml",
      },
    })
  }

  setUrl(baseUrl: string) {
    this.apisauce.setBaseURL(baseUrl)
  }

  setAuthorization(token: string) {
    this.apisauce.setHeader("Authorization", `Basic ${token}`)
  }

  clearAuthorization() {
    this.apisauce.deleteHeader("Authorization")
  }

  /**
   * Connnect OPDS Server
   *
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async loadOPDS(path?: string): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(path)

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * Initialize Calibre
   *
   * @returns {(Promise<{ kind: "ok"; data: ApiCalibreInterfaceType } | GeneralApiProblem>)}
   * @memberof Api
   */
  async initializeCalibre(): Promise<
    { kind: "ok"; data: ApiCalibreInterfaceType } | GeneralApiProblem
  > {
    /* this.apisauce.setHeader(
      "Authorization",
      `Digest username="Hikaru", realm="calibre", nonce="415ac5608f2e9c690001:74d63386f75735e211e70a402f63c0f99232ed431575da10925b24baa0105b0b", uri="/interface-data/update/1c3bdc26caf3cb9a377550f0f6c19a9acaa23393?1693787767213", algorithm=MD5, response="f91781cb80149e898fcb0ef1c5fe7962", qop=auth, nc=00000001, cnonce="2c875dcb2ca74015"`,
    )
    const response: ApiResponse<ApiCalibreInterfaceType> = await this.apisauce.get(
      `/interface-data/update/1c3bdc26caf3cb9a377550f0f6c19a9acaa23393?1693787767213`,
      {},
      {},
    )

    console.tron.log(response)

    if (!response.ok) {
      if (response.headers["www-authenticate"]) {
        const parsed = parse(response.headers["www-authenticate"])

        this.apisauce.setHeader(
          "Authorization",
          `Digest username="Hikaru", realm="calibre", nonce="415ac5608f2e9c690001:74d63386f75735e211e70a402f63c0f99232ed431575da10925b24baa0105b0b", uri="/interface-data/update/1c3bdc26caf3cb9a377550f0f6c19a9acaa23393?1693787767213", algorithm=MD5, response="f91781cb80149e898fcb0ef1c5fe7962", qop=auth, nc=00000001, cnonce="2c875dcb2ca74015"`,
        )

        console.tron.log(this.apisauce.headers)
      }
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data } */
    const response: ApiResponse<ApiCalibreInterfaceType> = await this.apisauce.get(
      `/interface-data/update?${Date.now()}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * get Library
   *
   * @returns {(Promise<{ kind: "ok"; data: ApiBookInfo  } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getLibrary(
    library: string,
    searchText: string,
    sort: string,
    sortOrder: string,
  ): Promise<{ kind: "ok"; data: ApiBookInfo } | GeneralApiProblem> {
    const response: ApiResponse<ApiBookInfo> = await this.apisauce.get(
      `interface-data/books-init?library_id=${library}${
        searchText ? `&search=${searchText}` : ""
      }&sort=${sort}.${sortOrder}&${Date.now()}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * get mote library
   *
   * @returns {(Promise<{ kind: "ok"; data: unknown } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getMoreLibrary(
    library: string,
    json,
  ): Promise<{ kind: "ok"; data: ApiBookInfoCore } | GeneralApiProblem> {
    const response: ApiResponse<ApiBookInfoCore> = await this.apisauce.post(
      `interface-data/more-books?library_id=${library}`,
      json,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * get Tag Browser
   *
   * @returns {(Promise<{ kind: "ok"; data: ApiTagBrowser } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getTagBrowser(
    library: string,
  ): Promise<{ kind: "ok"; data: ApiTagBrowser } | GeneralApiProblem> {
    const response: ApiResponse<ApiTagBrowser> = await this.apisauce.get(
      `interface-data/tag-browser?collapse_at=25&hide_empty_categories=no&library_id=${library}&partition_method=first%20letter&sort_tags_by=name`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * Check Book Converting
   *
   * @returns {(Promise<{ kind: "ok"; data: ApiBookManifestStatusType } | GeneralApiProblem>)}
   * @memberof Api
   */
  async CheckBookConverting(
    libraryId: string,
    bookId: number,
    bookType: string,
  ): Promise<
    { kind: "ok"; data: ApiBookManifestStatusType | ApiBookManifestResultType } | GeneralApiProblem
  > {
    const response: ApiResponse<ApiBookManifestStatusType | ApiBookManifestResultType> =
      await this.apisauce.get(
        `book-manifest/${bookId}/${bookType}?library_id=${libraryId}&${Date.now()}`,
      )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * Get library information
   *
   * @returns {(Promise<{ kind: "ok"; data: ApiBookFile } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getLibraryInformation(
    libraryId: string,
    bookId: number,
    bookType: string,
    bookSize: number,
    hash: number,
    spine: string,
  ): Promise<{ kind: "ok"; data: ApiBookFile } | GeneralApiProblem> {
    const response: ApiResponse<ApiBookFile> = await this.apisauce.get(
      `book-file/${bookId}/${bookType}/${bookSize}/${hash}/${spine}?library_id=${libraryId}&${Date.now()}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * Delete the book with the specified ID.
   * @param libraryId
   * @param bookId
   * @returns
   */
  async deleteBook(libraryId: string, bookId: number) {
    const response: ApiResponse<unknown> = await this.apisauce.post(
      `cdb/delete-books/${bookId}/${libraryId}?${Date.now()}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }

  async uploadFile(
    fileName: string,
    libraryName: string,
    formData: string,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    await FileSystem.uploadAsync(
      `${this.apisauce.getBaseURL()}/cdb/add-book/0/n/${fileName}/${libraryName}`,
      formData,
      {
        headers: this.apisauce.headers,
      },
    )

    /*if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }*/

    return { kind: "ok" }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
