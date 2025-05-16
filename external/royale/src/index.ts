import { Context, Schema } from "koishi";
import { playerinfo } from "./player/playerinfo/playerinfo";
import { claninfo } from "./clan/claninfo/claninfo";
import { formatResponse, failure } from "./utils/response";
import { usage } from "./usage";

export const name = "royale";

export interface Config {
    apiKey: string;
}

export const Config: Schema<Config> = Schema.object({
    apiKey: Schema.string().description("Clash Royale API密钥").required(),
});

export function apply(ctx: Context, config: Config) {
    // 检查API密钥是否设置
    if (!config.apiKey) {
        console.error("未设置API密钥，请在插件配置中设置");
    }

    const cmd = ctx.command("royale", "Clash Royale相关功能").usage(usage);

    cmd.subcommand(".playerinfo <tag>", "查询一些玩家个人信息")
        .example("/royale.playerinfo #CJ2L9PGLG")
        .action(async (_, tag) => {
            if (!tag || tag.trim() === "") {
                return formatResponse(failure("参数不足", "请提供玩家标签"));
            }
            try {
                const result = await playerinfo(tag, config.apiKey);
                return result; // playerinfo 函数内部已经处理了标准响应格式
            } catch (error) {
                return formatResponse(
                    failure("查询玩家信息失败", error.message)
                );
            }
        });

    cmd.subcommand(".claninfo <tag>", "查询部落信息")
        .example("/royale.claninfo #2LUGUPJ")
        .action(async (_, tag) => {
            if (!tag || tag.trim() === "") {
                return formatResponse(failure("参数不足", "请提供部落标签"));
            }
            try {
                const result = await claninfo(tag, config.apiKey);
                return result; // claninfo 函数内部已经处理了标准响应格式
            } catch (error) {
                return formatResponse(
                    failure("查询部落信息失败", error.message)
                );
            }
        });
}
