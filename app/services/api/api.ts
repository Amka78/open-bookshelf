/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import Config from "@/config"
import { logger } from "@/utils/logger"
import { type ApiResponse, type ApisauceInstance, create } from "apisauce"
import { type Directory, type DownloadOptions, File as FileSystemFile } from "expo-file-system"
import { Platform } from "react-native"
import { type GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import {
  type DigestChallenge,
  computeDigestHeader,
  generateCnonce,
  parseDigestChallenge,
} from "./digestAuth"

import type {
  ApiBookFile,
  ApiBookInfo,
  ApiBookInfoCore,
  ApiConversionBookData,
  ApiConversionStart,
  ApiConversionStatus,
  ApiBookManifestResultType,
  ApiBookManifestStatusType,
  ApiCalibreInterfaceType,
  ApiConfig,
  ApiFeedResponse,
  ApiTagBrowser,
  SetBookMetadata,
  SetBookResult,
} from "./api.types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 20000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  authenticaion: Record<string, string>
  private credentials: { username: string; password: string; basicToken: string } | null = null
  private authMethod: "basic" | "digest" | null = null
  private digestChallenge: DigestChallenge | null = null
  private digestNc = 0

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/atom+xml",
      },
    })
    this.setupAuthInterceptors()
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
   * Store credentials for HTTP auth negotiation (Basic or Digest).
   * No Authorization header is set immediately — the interceptors will
   * handle the server challenge and pick the right scheme automatically.
   */
  setCredentials(username: string, password: string, basicToken: string) {
    this.credentials = { username, password, basicToken }
    this.authMethod = null
    this.digestChallenge = null
    this.digestNc = 0
    this.apisauce.deleteHeader("Authorization")
  }

  clearCredentials() {
    this.credentials = null
    this.authMethod = null
    this.digestChallenge = null
    this.digestNc = 0
    this.apisauce.deleteHeader("Authorization")
  }

  /**
   * Return the correct Authorization header for a given URL.
   * For Digest auth the header is URL-specific (the URI is part of the hash).
   * For Basic auth the header is the same regardless of URL.
   * Used by image loaders, file downloads, and viewers that bypass axios.
   */
  getAuthHeaders(url?: string, method = "GET"): Record<string, string> | undefined {
    if (!this.credentials) return undefined

    if (this.authMethod === "digest" && this.digestChallenge) {
      if (!url) return undefined
      this.digestNc++
      const cnonce = generateCnonce()
      const uri = this.getDigestUri(url)
      return {
        Authorization: computeDigestHeader(
          this.digestChallenge,
          this.credentials.username,
          this.credentials.password,
          method,
          uri,
          this.digestNc,
          cnonce,
        ),
      }
    }

    if (this.credentials.basicToken) {
      return { Authorization: `Basic ${this.credentials.basicToken}` }
    }

    return undefined
  }

  private getDigestUri(url?: string, baseURL?: string): string {
    try {
      const fullUrl = new URL(url ?? "", baseURL || this.apisauce.getBaseURL())
      return fullUrl.pathname + fullUrl.search
    } catch {
      if (!url) return "/"
      return url.startsWith("/") ? url : `/${url}`
    }
  }

  private setupAuthInterceptors() {
    const axiosInstance = this.apisauce.axiosInstance

    // Proactively add auth header for subsequent requests after
    // the server's auth method has been determined.
    axiosInstance.interceptors.request.use((config) => {
      const cfg = config as typeof config & { _authRetry?: boolean }
      // Skip if this is a retry from the response interceptor (header already set)
      if (cfg._authRetry) return config

      if (!this.credentials) return config

      if (this.digestChallenge) {
        this.digestNc++
        const cnonce = generateCnonce()
        const uri = this.getDigestUri(config.url, config.baseURL)
        const method = (config.method || "GET").toUpperCase()

        config.headers["Authorization"] = computeDigestHeader(
          this.digestChallenge,
          this.credentials.username,
          this.credentials.password,
          method,
          uri,
          this.digestNc,
          cnonce,
        )
      } else if (this.authMethod === "basic") {
        config.headers["Authorization"] = `Basic ${this.credentials.basicToken}`
      }
      // If authMethod is null, no header is sent — the server will challenge us
      return config
    })

    // Handle 401 challenges: parse WWW-Authenticate and retry with the
    // correct scheme (Basic or Digest).
    // Also handles the case where WWW-Authenticate is not accessible
    // (e.g., CORS blocking on web) by trying Basic auth as a fallback.
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as typeof error.config & {
          _authRetry?: boolean
        }
        if (!originalRequest || originalRequest._authRetry) {
          return Promise.reject(error)
        }

        if (error.response?.status === 401 && this.credentials) {
          const headers = error.response.headers
          const wwwAuthenticate =
            typeof headers?.get === "function"
              ? headers.get("www-authenticate")
              : headers?.["WWW-Authenticate"] ?? headers?.["www-authenticate"]

          // Build a clean retry config to avoid issues with reusing
          // processed axios configs.
          const retryHeaders =
            typeof originalRequest.headers?.toJSON === "function"
              ? { ...originalRequest.headers.toJSON() }
              : { ...(originalRequest.headers ?? {}) }

          const retryConfig = {
            method: originalRequest.method,
            url: originalRequest.url,
            baseURL: originalRequest.baseURL,
            headers: retryHeaders,
            params: originalRequest.params,
            data: originalRequest.data,
            timeout: originalRequest.timeout,
            responseType: originalRequest.responseType,
            _authRetry: true,
          }

          if (wwwAuthenticate) {
            // Try Digest first
            const challenge = parseDigestChallenge(wwwAuthenticate)
            if (challenge) {
              this.digestChallenge = challenge
              this.authMethod = "digest"
              this.digestNc = 1
              const cnonce = generateCnonce()
              const uri = this.getDigestUri(originalRequest.url, originalRequest.baseURL)
              const method = (originalRequest.method || "GET").toUpperCase()

              retryConfig.headers["Authorization"] = computeDigestHeader(
                challenge,
                this.credentials.username,
                this.credentials.password,
                method,
                uri,
                this.digestNc,
                cnonce,
              )

              try {
                return await axiosInstance.request(retryConfig)
              } catch {
                this.digestChallenge = null
                this.authMethod = null
                this.digestNc = 0
                return Promise.reject(error)
              }
            }

            // Fall back to Basic if the challenge header indicates Basic
            if (wwwAuthenticate.toLowerCase().startsWith("basic")) {
              this.authMethod = "basic"
              this.apisauce.setHeader(
                "Authorization",
                `Basic ${this.credentials.basicToken}`,
              )
              retryConfig.headers["Authorization"] =
                `Basic ${this.credentials.basicToken}`

              try {
                return await axiosInstance.request(retryConfig)
              } catch {
                this.authMethod = null
                this.apisauce.deleteHeader("Authorization")
                return Promise.reject(error)
              }
            }
          }

          // WWW-Authenticate header not available (e.g. CORS blocking on web).
          // Try Basic auth first; if the server rejects it with 400
          // "Unsupported authentication method", it needs Digest auth —
          // but we can't negotiate Digest without the WWW-Authenticate header.
          if (!wwwAuthenticate && !this.authMethod) {
            logger.warn(
              "WWW-Authenticate header not available. Trying Basic auth.",
              "If using a CORS proxy, add: Access-Control-Expose-Headers: WWW-Authenticate",
            )
            retryConfig.headers["Authorization"] =
              `Basic ${this.credentials.basicToken}`

            try {
              const retryResponse = await axiosInstance.request(retryConfig)
              // Basic auth worked
              this.authMethod = "basic"
              this.apisauce.setHeader(
                "Authorization",
                `Basic ${this.credentials.basicToken}`,
              )
              return retryResponse
            } catch (basicError) {
              const basicStatus = (basicError as any)?.response?.status
              const basicData = (basicError as any)?.response?.data
              if (
                basicStatus === 400 &&
                typeof basicData === "string" &&
                basicData.includes("Unsupported")
              ) {
                // Server requires Digest auth but we can't negotiate
                // without WWW-Authenticate header. Propagate as 401
                // so the LoginModal shows with a helpful error.
                logger.error(
                  "Server requires Digest auth but WWW-Authenticate header is not accessible.",
                  "Update your CORS proxy config to add: Access-Control-Expose-Headers: WWW-Authenticate",
                )
              }
              return Promise.reject(error)
            }
          }
        }

        return Promise.reject(error)
      },
    )
  }

  /**
   * Make a HEAD request to the given URL so the axios interceptors can run
   * the 401 challenge-response and determine the auth method (Basic / Digest).
   * Call this before any download that bypasses axios (e.g. File.downloadFileAsync).
   */
  private async ensureAuthNegotiated(url: string): Promise<void> {
    if (this.authMethod !== null || !this.credentials) return
    try {
      await this.apisauce.axiosInstance.head(url)
    } catch {
      // Auth negotiation is handled by the interceptors.
      // Errors here (including the initial 401 challenge) are expected.
    }
  }

  /**
   * Download a file with automatic Digest/Basic auth handling.
   *
   * Unlike File.downloadFileAsync, this method:
   * 1. Ensures auth has been negotiated via axios (handles the case where
   *    authMethod is null after an app restart).
   * 2. Retries once on a 401 response to handle stale Digest nonces.
   */
  async downloadFileWithAuth(
    url: string,
    destination: FileSystemFile | Directory,
    options?: DownloadOptions,
  ): ReturnType<typeof FileSystemFile.downloadFileAsync> {
    await this.ensureAuthNegotiated(url)
    const headers = this.getAuthHeaders(url)
    try {
      return await FileSystemFile.downloadFileAsync(url, destination, { ...options, headers })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      // Both iOS ("status 401") and Android ("status: 401") use this pattern.
      if (/status:?\s*401/i.test(msg) && this.credentials) {
        // Stale nonce or auth not yet negotiated — reset and retry once.
        this.digestChallenge = null
        this.authMethod = null
        this.digestNc = 0
        await this.ensureAuthNegotiated(url)
        const retryHeaders = this.getAuthHeaders(url)
        return FileSystemFile.downloadFileAsync(url, destination, { ...options, headers: retryHeaders })
      }
      throw error
    }
  }

  getBookDownloadUrl(format: string, bookId: number, libraryId: string): string {
    return `${this.apisauce.getBaseURL()}/get/${encodeURIComponent(format)}/${bookId}/${libraryId}`
  }

  getBookThumbnailUrl(bookId: number, libraryId: string, size = "300x400"): string {
    return `${this.apisauce.getBaseURL()}/get/thumb/${bookId}/${libraryId}?sz=${encodeURIComponent(
      size,
    )}`
  }

  getInlineBookUrl(format: string, bookId: number, libraryId = "config"): string {
    return `${this.apisauce.getBaseURL()}/get/${encodeURIComponent(
      format,
    )}/${bookId}/${libraryId}?content_disposition=inline`
  }

  getBookFileUrl(
    bookId: number,
    format: string,
    size: number,
    hash: number,
    path: string,
    libraryId: string,
    baseUrl?: string,
  ): string {
    const targetBaseUrl = baseUrl ?? this.apisauce.getBaseURL()
    return encodeURI(
      `${targetBaseUrl}/book-file/${bookId}/${encodeURIComponent(
        format,
      )}/${size}/${hash}/${path}?library_id=${libraryId}`,
    )
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
    vl?: string | null,
  ): Promise<{ kind: "ok"; data: ApiBookInfo } | GeneralApiProblem> {
    const encodedSearchText = searchText ? encodeURIComponent(searchText) : ""

    const response: ApiResponse<ApiBookInfo> = await this.apisauce.get(
      `interface-data/books-init?library_id=${library}${
        encodedSearchText ? `&search=${encodedSearchText}` : ""
      }${vl ? `&vl=${encodeURIComponent(vl)}` : ""}&sort=${sort}.${sortOrder}&${Date.now()}`,
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
    logger.debug("getMoreLibrary", library, json)
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
    convertParams?: Record<string, string | number | boolean>,
  ): Promise<
    | {
        kind: "ok"
        data: ApiBookManifestStatusType | ApiBookManifestResultType
      }
    | GeneralApiProblem
  > {
    const extraQuery = convertParams
      ? Object.entries(convertParams)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : ""
    const response: ApiResponse<ApiBookManifestStatusType | ApiBookManifestResultType> =
      await this.apisauce.get(
        `book-manifest/${bookId}/${bookType}?library_id=${libraryId}&${Date.now()}${
          extraQuery ? `&${extraQuery}` : ""
        }`,
      )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  /**
   * Start book conversion via Calibre Content Server.
   *
   * Calls `POST conversion/start/{bookId}?library_id={libraryId}&sort=timestamp.desc`
   * and passes conversion settings in the JSON body.
   */
  async startConversion(
    libraryId: string,
    bookId: number,
    inputFmt: string,
    outputFmt: string,
    convertParams?: Record<string, string | number | boolean>,
  ): Promise<{ kind: "ok"; data: ApiConversionStart } | GeneralApiProblem> {
    const requestBody = {
      input_fmt: inputFmt,
      output_fmt: outputFmt,
      ...(convertParams ?? {}),
    }
    const response: ApiResponse<ApiConversionStart> = await this.apisauce.post(
      `conversion/start/${bookId}?library_id=${encodeURIComponent(libraryId)}&sort=timestamp.desc`,
      requestBody,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  async getConversionStatus(
    libraryId: string,
    jobId: number,
  ): Promise<{ kind: "ok"; data: ApiConversionStatus } | GeneralApiProblem> {
    const response: ApiResponse<ApiConversionStatus> = await this.apisauce.get(
      `conversion/status/${jobId}?library_id=${encodeURIComponent(libraryId)}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  async getConversionBookData(
    libraryId: string,
    bookId: number,
    inputFmt?: string,
    outputFmt?: string,
  ): Promise<{ kind: "ok"; data: ApiConversionBookData } | GeneralApiProblem> {
    const query = [
      `library_id=${encodeURIComponent(libraryId)}`,
      inputFmt ? `input_fmt=${encodeURIComponent(inputFmt)}` : "",
      outputFmt ? `output_fmt=${encodeURIComponent(outputFmt)}` : "",
    ]
      .filter(Boolean)
      .join("&")

    const response: ApiResponse<ApiConversionBookData> = await this.apisauce.get(
      `conversion/book-data/${bookId}?${query}`,
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
  /**
   * Delete the book with the specified ID.
   * @param libraryId
   * @param bookId
   * @returns
   */
  async editBook(libraryId: string, bookId: number, bookData: SetBookMetadata) {
    const response: ApiResponse<SetBookResult> = await this.apisauce.post(
      `cdb/set-fields/${bookId}/${libraryId}`,
      bookData,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok", data: response.data }
  }

  async uploadFile(
    fileName: string,
    libraryName: string,
    file: string | File,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    logger.debug("uploadFile", fileName, libraryName, file)
    const uploadUrl = `${this.apisauce.getBaseURL()}/cdb/add-book/0/n/${fileName}/${libraryName}`

    if (typeof file === "string") {
      if (Platform.OS === "web") {
        const formData = new FormData()
        logger.debug("[Api] request", { method: "GET", url: file })
        const response = await fetch(file)
        logger.debug("[Api] response", {
          ok: response.ok,
          status: response.status,
          url: file,
          method: "GET",
        })
        const blob = await response.blob()
        formData.append("file", blob, fileName)

        logger.debug("[Api] request", {
          method: "POST",
          url: uploadUrl,
          data: { fileName, libraryName },
        })
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: this.apisauce.headers,
          body: formData,
        })
        logger.debug("[Api] response", {
          ok: uploadResponse.ok,
          status: uploadResponse.status,
          url: uploadUrl,
          method: "POST",
          data: uploadResponse,
        })

        if (!uploadResponse.ok) {
          switch (uploadResponse.status) {
            case 401:
              return { kind: "unauthorized" }
            case 403:
              return { kind: "forbidden" }
            case 404:
              return { kind: "not-found", message: await uploadResponse.text() }
            default:
              if (uploadResponse.status >= 500) {
                return { kind: "server" }
              }

              if (uploadResponse.status >= 400) {
                return { kind: "rejected" }
              }
          }
        }

        return { kind: "ok" }
      }

      logger.debug("[Api] request", {
        method: "POST",
        url: uploadUrl,
        data: { fileName, libraryName },
      })
      const formData = new FormData()
      formData.append("file", new FileSystemFile(file), fileName)

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: this.apisauce.headers,
        body: formData,
      })
      logger.debug("[Api] response", {
        ok: response.ok,
        status: response.status,
        url: uploadUrl,
        method: "POST",
        data: response,
      })

      if (!response.ok) {
        switch (response.status) {
          case 401:
            return { kind: "unauthorized" }
          case 403:
            return { kind: "forbidden" }
          case 404:
            return { kind: "not-found", message: await response.text() }
          default:
            if (response.status >= 500) {
              return { kind: "server" }
            }

            if (response.status >= 400) {
              return { kind: "rejected" }
            }
        }
      }

      return { kind: "ok" }
    }

    const formData = new FormData()
    formData.append("file", file, fileName)

    logger.debug("[Api] request", {
      method: "POST",
      url: uploadUrl,
      data: { fileName, libraryName },
    })
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: this.apisauce.headers,
      body: formData,
    })
    logger.debug("[Api] response", {
      ok: response.ok,
      status: response.status,
      url: uploadUrl,
      method: "POST",
      data: response,
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          return { kind: "unauthorized" }
        case 403:
          return { kind: "forbidden" }
        case 404:
          return { kind: "not-found", message: await response.text() }
        default:
          if (response.status >= 500) {
            return { kind: "server" }
          }

          if (response.status >= 400) {
            return { kind: "rejected" }
          }

          return { kind: "unknown", temporary: true }
      }
    }

    return { kind: "ok" }
  }

  async uploadBookFormat(
    libraryId: string,
    bookId: number,
    format: string,
    fileName: string,
    file: string | File,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    logger.debug("uploadBookFormat", { libraryId, bookId, format, fileName })

    const uploadUrl = `${this.apisauce.getBaseURL()}/cdb/add-format/${bookId}/${encodeURIComponent(
      format,
    )}/${libraryId}`

    if (typeof file === "string") {
      if (Platform.OS === "web") {
        const formData = new FormData()
        logger.debug("[Api] request", { method: "GET", url: file })
        const response = await fetch(file)
        logger.debug("[Api] response", {
          ok: response.ok,
          status: response.status,
          url: file,
          method: "GET",
        })
        const blob = await response.blob()
        formData.append("file", blob, fileName)

        logger.debug("[Api] request", {
          method: "POST",
          url: uploadUrl,
          data: { fileName, libraryId, bookId, format },
        })
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: this.apisauce.headers,
          body: formData,
        })
        logger.debug("[Api] response", {
          ok: uploadResponse.ok,
          status: uploadResponse.status,
          url: uploadUrl,
          method: "POST",
          data: uploadResponse,
        })

        if (!uploadResponse.ok) {
          switch (uploadResponse.status) {
            case 401:
              return { kind: "unauthorized" }
            case 403:
              return { kind: "forbidden" }
            case 404:
              return { kind: "not-found", message: await uploadResponse.text() }
            default:
              if (uploadResponse.status >= 500) {
                return { kind: "server" }
              }

              if (uploadResponse.status >= 400) {
                return { kind: "rejected" }
              }
          }
        }

        return { kind: "ok" }
      }

      const formData = new FormData()
      formData.append("file", new FileSystemFile(file), fileName)

      logger.debug("[Api] request", {
        method: "POST",
        url: uploadUrl,
        data: { fileName, libraryId, bookId, format },
      })
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: this.apisauce.headers,
        body: formData,
      })
      logger.debug("[Api] response", {
        ok: response.ok,
        status: response.status,
        url: uploadUrl,
        method: "POST",
        data: response,
      })

      if (!response.ok) {
        switch (response.status) {
          case 401:
            return { kind: "unauthorized" }
          case 403:
            return { kind: "forbidden" }
          case 404:
            return { kind: "not-found", message: await response.text() }
          default:
            if (response.status >= 500) {
              return { kind: "server" }
            }

            if (response.status >= 400) {
              return { kind: "rejected" }
            }
        }
      }

      return { kind: "ok" }
    }

    const formData = new FormData()
    formData.append("file", file, fileName)

    logger.debug("[Api] request", {
      method: "POST",
      url: uploadUrl,
      data: { fileName, libraryId, bookId, format },
    })
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: this.apisauce.headers,
      body: formData,
    })
    logger.debug("[Api] response", {
      ok: response.ok,
      status: response.status,
      url: uploadUrl,
      method: "POST",
      data: response,
    })

    if (!response.ok) {
      switch (response.status) {
        case 401:
          return { kind: "unauthorized" }
        case 403:
          return { kind: "forbidden" }
        case 404:
          return { kind: "not-found", message: await response.text() }
        default:
          if (response.status >= 500) {
            return { kind: "server" }
          }

          if (response.status >= 400) {
            return { kind: "rejected" }
          }

          return { kind: "unknown", temporary: true }
      }
    }

    return { kind: "ok" }
  }

  async deleteBookFormat(
    libraryId: string,
    bookId: number,
    format: string,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<unknown> = await this.apisauce.post(
      `cdb/delete-format/${bookId}/${encodeURIComponent(format)}/${libraryId}?${Date.now()}`,
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }

  async syncReadingPosition(
    libraryId: string,
    bookId: number,
    format: string,
    page: number,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<unknown> = await this.apisauce.post(
      `cdb/set-fields/${bookId}/${libraryId}`,
      {
        changes: { reading_pos: { format, page } },
        loaded_book_ids: [bookId],
      },
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
