import { Context, Schema } from "koishi";
import { update } from "./update/update";
import { randomPicture } from "./random/random";
import { formatResponse, failure } from "./utils/response";
import { usage } from "./usage";

export const name = "ygo";
export { usage };

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
    const cmd = ctx.command("ygo", "YuGiOh相关功能").usage(usage);

    cmd.subcommand(".update", "更新卡牌数据库，请勿大量调用", {
        authority: 4,
    }).action(async ({ session }) => {
        try {
            const result = await update();
            return result; // update 函数内部已处理标准响应格式
        } catch (error) {
            return formatResponse(failure("更新卡牌数据库失败", error.message));
        }
    });

    cmd.subcommand(".random", "随机卡牌").action(async ({ session }) => {
        try {
            const result = await randomPicture();
            return result.imageSegment; // 这个已经是消息段，直接返回
        } catch (error) {
            return formatResponse(failure("随机卡牌失败", error.message));
        }
    });
}
