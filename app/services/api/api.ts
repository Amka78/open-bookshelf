/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"

import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"

import type {
  ApiConfig,
  ApiFeedResponse, // @demo remove-current-line
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

  /**
   * Connnect OPDS Server
   *
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */
  async loadOPDS(path?: string): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(path)

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    console.log(response.data)

    return { kind: "ok", data: response.data }
  }

  /**
   * Initialize Calibre
   *
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */
  async initializeCalibre(): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `/interface-data/update?${Date.now}`,
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
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getLibrary(
    library: string,
    searchText: string,
    sort: string,
    sortOrder: string,
  ): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `interface-data/books-init?library_id=${library}${
        searchText ? `&search=${searchText}` : ""
      }&sort=${sort}.${sortOrder}&${Date.now}`,
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
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getMoreLibrary(
    library: string,
    json,
  ): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.post(
      `interface-data/more-books?library_id=${library}`,
      json,
    )

    console.log(response)
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * get Tag Browser
   *
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getTagBrowser(library: string): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
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
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */
  async CheckBookConverting(
    libraryId: string,
    bookId: number,
    bookType: string,
  ): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `book-manifest/${bookId}/${bookType}?library_id=${libraryId}&${Date.now}`,
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
   * @returns {(Promise<{ kind: "ok"; data: any } | GeneralApiProblem>)}
   * @memberof Api
   */
  async getLibraryInformation(
    libraryId: string,
    bookId: number,
    bookType: string,
    bookSize: number,
    hash: number,
    spine: string,
  ): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `book-file/${bookId}/${bookType}/${bookSize}/${hash}/${spine}?library_id=${libraryId}&${Date.now}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
