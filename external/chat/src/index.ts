import { Context, Schema } from "koishi";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { formatResponse, success, failure } from "./utils/response";
import { filterThinking } from "./utils/filter";
import { usage } from "./usage";

export const name = "chat";
export { usage };

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

// 加载prompts配置文件
const promptsPath = path.resolve(__dirname, "../config/prompts.txt");
const prompts = fs.readFileSync(promptsPath, "utf-8").trim();

// 初始化OpenAI客户端
const openai = new OpenAI({
    baseURL: "http://127.0.0.1:8000/v1",
    apiKey: "",
});

// 测试过滤函数
console.log("测试过滤函数:");
const testInput = `<think>这是思考内容</think>\n\n这是正常回复`;
console.log(`原始内容: "${testInput}"`);
console.log(`过滤后: "${filterThinking(testInput)}"`);

export function apply(ctx: Context) {
    ctx.command("chat <message:text> 你的输入（无输入时返回Prompts设定）")
        .usage(usage)
        .action(async (_, message) => {
            if (!message || message.trim() === "") {
                message = "你好！";
            }

            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: prompts },
                        { role: "user", content: message },
                    ],
                    model: "deepseek-reasoner-web",
                });

                const rawResponse = completion.choices[0].message.content;
                // 过滤掉思考部分
                const aiResponse = filterThinking(rawResponse);
                return formatResponse(success("AI回复", aiResponse));
            } catch (error) {
                console.error("AI回复失败:", error);
                return formatResponse(failure("AI回复失败", error.message));
            }
        });
}
