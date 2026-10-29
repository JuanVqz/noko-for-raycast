import { getPreferenceValues } from "@raycast/api";
import { IPreferences, ApiResponse } from "../types";
import { TOAST_MESSAGES } from "../constants";

const NOKO_BASE_URL = "https://api.nokotime.com/v2";

export interface ApiClientOptions {
  signal?: AbortSignal;
}

const isSocketError = (error: unknown): boolean =>
  error instanceof Error && /socket|ECONNRESET|terminated/i.test(error.message);

class ApiClient {
  private baseUrl: string;
  public headers: Record<string, string>;

  constructor() {
    this.baseUrl = NOKO_BASE_URL;
    this.headers = this.getHeaders();
  }

  private getHeaders(): Record<string, string> {
    const { personalAccessToken } = getPreferenceValues<IPreferences>();

    return {
      "X-NokoToken": personalAccessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        error: TOAST_MESSAGES.ERROR.REQUEST_CANCELLED,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : TOAST_MESSAGES.ERROR.NETWORK_ERROR,
    };
  }

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    const text = await response.text();

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Handle empty responses (common for PUT/DELETE operations)
    if (!text.trim()) {
      return {
        success: true,
        data: {} as T,
      };
    }

    // Parse JSON if content type indicates it
    if (contentType?.includes("application/json")) {
      try {
        const data = JSON.parse(text);
        return {
          success: true,
          data,
        };
      } catch {
        return {
          success: false,
          error: "Failed to parse JSON response",
        };
      }
    }

    return {
      success: true,
      data: text as T,
    };
  }

  // Mutating requests ask for a fresh connection so they never reuse a pooled
  // keep-alive socket that went stale while the user was filling a form
  // ("socket idle timeout"). Reads are safe to retry once instead.
  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions,
  ): Promise<ApiResponse<T>> {
    const isRead = method === "GET";
    const headers = isRead
      ? this.headers
      : { ...this.headers, Connection: "close" };

    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: options?.signal,
        });
        return await this.parseResponse<T>(response);
      } catch (error) {
        if (isRead && attempt === 0 && isSocketError(error)) continue;
        return this.handleError(error);
      }
    }
  }

  async get<T>(
    endpoint: string,
    options?: ApiClientOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data, options);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  async delete<T>(
    endpoint: string,
    options?: ApiClientOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
