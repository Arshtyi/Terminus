import { segment } from "koishi";
export interface PluginResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export function success<T>(message: string, data?: T): PluginResponse<T> {
    return {
        success: true,
        message,
        data,
    };
}
export function failure(message: string, error?: string): PluginResponse {
    return {
        success: false,
        message,
        error,
    };
}
export function formatResponse(response: PluginResponse): string | any {
    if (!response.success) {
        return `${
            response.error ? `错误详情: ${response.error}` : response.message
        }`;
    }
    if (
        response.data &&
        typeof response.data === "object" &&
        "type" in response.data
    ) {
        return response.data;
    }
    if (response.data && typeof response.data === "string") {
        return response.data;
    }
    return response.message;
}
