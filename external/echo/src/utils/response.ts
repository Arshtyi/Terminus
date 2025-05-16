import { segment } from "koishi";

/**
 * 标准响应接口
 */
export interface PluginResponse<T = any> {
    /**
     * 响应状态：true 表示成功，false 表示失败
     */
    success: boolean;

    /**
     * 响应消息：为用户展示的文本内容
     */
    message: string;

    /**
     * 响应数据：可以是任何类型，根据插件的功能不同而不同
     */
    data?: T;

    /**
     * 错误信息：当响应失败时提供的错误详情
     */
    error?: string;
}

/**
 * 创建成功响应
 * @param message 响应消息
 * @param data 响应数据
 * @returns 标准化的成功响应
 */
export function success<T>(message: string, data?: T): PluginResponse<T> {
    return {
        success: true,
        message,
        data,
    };
}

/**
 * 创建失败响应
 * @param message 响应消息
 * @param error 错误详情
 * @returns 标准化的失败响应
 */
export function failure(message: string, error?: string): PluginResponse {
    return {
        success: false,
        message,
        error,
    };
}

/**
 * 将标准响应对象格式化为字符串
 * @param response 标准响应对象
 * @returns 格式化后的响应字符串
 */
export function formatResponse(response: PluginResponse): string | any {
    if (!response.success) {
        return `${
            response.error ? `错误详情: ${response.error}` : response.message
        }`;
    }

    // 如果数据是 Koishi 的消息段，直接返回
    if (
        response.data &&
        typeof response.data === "object" &&
        "type" in response.data
    ) {
        return response.data;
    }

    // 直接返回数据，不包含message前缀
    if (response.data && typeof response.data === "string") {
        return response.data;
    }

    // 如果没有数据，则返回消息
    return response.message;
}
