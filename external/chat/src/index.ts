import { Context, Schema } from "koishi";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { formatResponse, success, failure } from "./utils/response";
import { filterThinking } from "./utils/filter";
import { usage } from "./usage";
export const name = "chat";
export { usage };
export interface Config {
    apiKey: string;
    baseURL: string;
    model: string;
}

export const Config: Schema<Config> = Schema.object({
    apiKey: Schema.string()
        .description("DeepSeek API 密钥")
        .default("")
        .required(false),
    baseURL: Schema.string()
        .description("DeepSeek API 基础 URL")
        .default("http://localhost:8000/v1"),
    model: Schema.string()
        .description("DeepSeek 模型名称")
        .default("deepseek-chat"),
});

const promptsPath = path.resolve(__dirname, "../config/prompts.txt");
const prompts = fs.readFileSync(promptsPath, "utf-8").trim();

export function apply(ctx: Context, config: Config) {
    const openai = new OpenAI({
        baseURL: config.baseURL,
        apiKey: config.apiKey || "",
        timeout: 60000, // 60秒超时
        maxRetries: 2,
        dangerouslyAllowBrowser: true,
    });

    ctx.command("chat <message:text>", '与 AI 对话（无输入="Hello!"）')
        .usage(usage)
        .action(async (_, message) => {
            if (!message || message.trim() === "") {
                message = "Hello!";
            }
            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: prompts },
                        { role: "user", content: message },
                    ],
                    model: config.model,
                    stream: false,
                    temperature: 0.7,
                    max_tokens: 1000,
                    presence_penalty: 0.0,
                    frequency_penalty: 0.0,
                });

                const rawResponse =
                    completion.choices[0]?.message?.content || "";
                const aiResponse = filterThinking(rawResponse);
                return formatResponse(success("AI回复", aiResponse));
            } catch (error) {
                console.error("AI回复失败:", error);
                return formatResponse(failure("AI回复失败", error.message));
            }
        });
}
