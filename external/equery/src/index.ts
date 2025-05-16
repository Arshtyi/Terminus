import { Context, Schema } from "koishi";
import { query } from "./query";
import { formatResponse, success, failure } from "./utils/response";
import { usage } from "./usage";

export const name = "equery";

export interface Config {
    apiKey: string;
}

export const Config: Schema<Config> = Schema.object({
    apiKey: Schema.string().description("验证令牌").required(),
});

export function apply(ctx: Context, config: Config) {
    ctx.command("equery <building> <room>", "查询山东大学青岛校区宿舍剩余电量")
        .usage(usage)
        .example("equery S1 A101 查询 S1 A101 的电量")
        .action(async (_, building, room) => {
            // 检查API密钥是否设置
            if (!config.apiKey) {
                return formatResponse(
                    failure(
                        "配置错误",
                        "未设置必要的API密钥，请在插件配置中设置"
                    )
                );
            }

            if (!building || !room) {
                return formatResponse(
                    failure(
                        "参数不足",
                        "请提供建筑和房间号，例如: equery S1 A101"
                    )
                );
            }

            (building = building.toUpperCase()), (room = room.toUpperCase());

            try {
                const queryResult = await query(building, room, config.apiKey);
                // 检查 queryResult 是否为有效对象
                if (!queryResult || typeof queryResult !== "object") {
                    return formatResponse(
                        failure("查询失败", "返回结果格式异常")
                    );
                }

                if (!queryResult.success) {
                    return formatResponse(
                        failure(
                            "查询失败",
                            queryResult.error ||
                                "请检查宿舍楼和房间号是否正确（或者排查令牌问题）"
                        )
                    );
                }

                // 打印调试信息
                console.log("查询结果:", JSON.stringify(queryResult));

                // 处理查询结果
                let electricityData = "数据获取失败";
                let buildingName = building;
                let roomInfo = room;
                let areaInfo = "青岛校区";

                // 从结果中提取详细信息
                if (queryResult.data) {
                    if (typeof queryResult.data === "object") {
                        // 新格式的返回值
                        electricityData =
                            queryResult.data.electricity || "未知";
                        buildingName =
                            queryResult.data.buildingName || building;
                        roomInfo = queryResult.data.room || room;
                        areaInfo = queryResult.data.areaName || "青岛校区";
                    } else {
                        // 旧格式的返回值兼容处理
                        electricityData = String(queryResult.data);
                    }
                } else if (queryResult.message) {
                    electricityData = String(queryResult.message);
                }

                // 生成响应消息
                const responseMessage =
                    `${areaInfo} ${buildingName} ${roomInfo}` +
                    `\n剩余电量: ${electricityData}`;

                return formatResponse(
                    success(`${buildingName} ${roomInfo}`, responseMessage)
                );
            } catch (error) {
                console.error("电量查询失败:", error);
                return formatResponse(failure("电量查询失败", error.message));
            }
        });
}
