import { Context, Schema } from "koishi";
import * as fs from "fs";
import * as path from "path";
import { formatResponse, success, failure } from "./utils/response";
import { usage } from "./usage";
export const name = "who";
export { usage };
export interface Config {}
export const Config: Schema<Config> = Schema.object({});
export function apply(ctx: Context) {
    ctx.command("who", "输出机器人信息")
        .usage(usage)
        .action(async (_) => {
            const filePath = path.resolve(__dirname, "../cfg/who.txt");
            try {
                const content = fs.readFileSync(filePath, "utf-8");
                return formatResponse(success("机器人信息", content));
            } catch (error) {
                console.error("读取机器人信息失败:", error);
                return formatResponse(success("机器人信息", "Hi"));
            }
        });
}
