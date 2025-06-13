import { Context, Schema } from "koishi";
import { query } from "./query";
import { formatResponse, success, failure } from "./utils/response";
import { usage } from "./usage";

export const name = "equery";

export interface Config {
    apiKey: string;
}

export const Config: Schema<Config> = Schema.object({
    apiKey: Schema.string()
        .description("验证令牌（Synjones-Auth值）")
        .default("")
        .required(false),
});

export function apply(ctx: Context, config: Config) {
    ctx.command("equery <building> <room>", "查询山东大学青岛校区宿舍剩余电量")
        .usage(usage)
        .example("equery S1 A101 查询 S1 A101 的电量")
        .action(async (_, building, room) => {
            if (!config.apiKey || config.apiKey.trim() === "") {
                return formatResponse(
                    failure(
                        "配置错误",
                        "未设置必要的API密钥，请在插件配置中设置Synjones-Auth验证令牌"
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
                console.log("查询结果:", JSON.stringify(queryResult));
                let electricityData = "数据获取失败";
                let buildingName = building;
                let roomInfo = room;
                let areaInfo = "青岛校区";
                if (queryResult.data) {
                    if (typeof queryResult.data === "object") {
                        electricityData =
                            queryResult.data.electricity || "未知";
                        buildingName =
                            queryResult.data.buildingName || building;
                        roomInfo = queryResult.data.room || room;
                        areaInfo = queryResult.data.areaName || "青岛校区";
                    } else {
                        electricityData = String(queryResult.data);
                    }
                } else if (queryResult.message) {
                    electricityData = String(queryResult.message);
                }
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
