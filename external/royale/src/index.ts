import { Context, Schema } from "koishi";
import { playerinfo } from "./player/playerinfo/playerinfo";
import { claninfo } from "./clan/claninfo/claninfo";
import { formatResponse, success, failure } from "./utils/response";
import { usage } from "./usage";

export const name = "royale";

export interface Config {
    apiKey: string;
}

export const Config: Schema<Config> = Schema.object({
    apiKey: Schema.string()
        .description(
            "Clash Royale API密钥 (可从开发者官网 https://developer.clashroyale.com 申请)"
        )
        .default("")
        .required(false),
});

export function apply(ctx: Context, config: Config) {
    // 检查API密钥是否设置
    if (!config.apiKey || config.apiKey.trim() === "") {
        console.error("未设置API密钥，请在插件配置中设置 Clash Royale API密钥");
    }

    const cmd = ctx.command("royale", "Clash Royale相关功能").usage(usage);

    // 添加设置 API 密钥的子命令
    cmd.subcommand(".setkey <key:string>", "设置API密钥")
        .option("admin", "-a 需要管理员权限", { authority: 3 })
        .action(async ({ session, options }, key) => {
            if (!key || key.trim() === "") {
                return formatResponse(
                    failure("参数不足", "请提供有效的API密钥")
                );
            }

            // 更新配置
            config.apiKey = key.trim();

            return formatResponse(
                success("配置成功", "API密钥已成功设置，此设置将在重启后失效")
            );
        });

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
