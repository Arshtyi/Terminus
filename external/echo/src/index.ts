import { Context, Schema } from "koishi";
import { formatResponse, success, failure } from "./utils/response";
import { usage } from "./usage";

export const name = "echo";
export { usage };

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
    ctx.command("echo <message:text> 你的输入")
        .usage(usage)
        .action((_, message) => {
            if (!message || message.trim() === "") {
                return formatResponse(failure("输入为空", "请提供有效输入"));
            }
            return formatResponse(success("回声", message));
        });
}
