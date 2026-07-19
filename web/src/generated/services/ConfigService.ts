/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class ConfigService {
  /**
   * Get current configuration
   * Returns the current server configuration
   * @returns any OK
   * @throws ApiError
   */
  public static getConfig(): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/config",
    });
  }
  /**
   * Update configuration
   * Updates server configuration
   * @param requestBody Configuration update request
   * @returns any OK
   * @throws ApiError
   */
  public static putConfig(
    requestBody: Record<string, any>,
  ): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/config",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        400: `Bad Request`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Restart server
   * Restarts the server process
   * @returns any OK
   * @throws ApiError
   */
  public static postConfigRestart(): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/config/restart",
    });
  }
  /**
   * Check setup status
   * Returns whether the initial setup has been completed
   * @returns any OK
   * @throws ApiError
   */
  public static getConfigSetup(): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/config/setup",
    });
  }
  /**
   * Complete setup
   * Marks the initial setup as completed
   * @returns any OK
   * @throws ApiError
   */
  public static postConfigSetupComplete(): CancelablePromise<
    Record<string, any>
  > {
    return __request(OpenAPI, {
      method: "POST",
      url: "/config/setup/complete",
      errors: {
        500: `Internal Server Error`,
      },
    });
  }
}
