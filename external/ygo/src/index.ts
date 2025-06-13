import { Context, Schema } from "koishi";
import { update } from "./update/update";
import { randomPicture } from "./random/random";
import { queryCardById } from "./query/query";
import { formatResponse, success, failure } from "./utils/response";
import { usage } from "./usage";
export const name = "ygo";
export { usage };
export interface Config {}
export const Config: Schema<Config> = Schema.object({});
export function apply(ctx: Context) {
    const cmd = ctx.command("ygo", "YuGiOh相关功能").usage(usage);
    cmd.subcommand(".update", "更新卡牌数据库，请勿大量调用", {
        authority: 4, // 需要管理员权限
    }).action(async ({ session }) => {
        try {
            return await update();
        } catch (error) {
            console.error("更新卡牌时出错:", error);
            return formatResponse(failure("更新卡牌数据库失败", error.message));
        }
    });
    cmd.subcommand(".random", "随机卡牌").action(async ({ session }) => {
        try {
            const result = await randomPicture();
            return formatResponse(success("随机卡牌", result.imageSegment));
        } catch (error) {
            console.error("随机卡牌时出错:", error);
            return formatResponse(failure("随机卡牌失败", error.message));
        }
    });

    cmd.subcommand(".query <id:string>", "通过ID查询卡牌").action(
        async ({ session }, id) => {
            if (!id) {
                return formatResponse(failure("查询失败", "请提供卡片ID"));
            }
            try {
                const result = await queryCardById(id);
                return formatResponse(
                    success(`ID: ${id} 的卡牌`, result.imageSegment)
                );
            } catch (error) {
                console.error(`查询ID为 ${id} 的卡牌时出错:`, error);
                return formatResponse(failure("查询卡牌失败", error.message));
            }
        }
    );
}
