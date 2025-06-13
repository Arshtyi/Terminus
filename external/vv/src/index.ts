import { Context, Schema, h } from "koishi";
import axios from "axios";
import { usage } from "./usage";

export const name = "vv";

export interface Config {
    apiBaseUrl: string;
    defaultImageCount: number;
    timeout: number;
}

export const Config: Schema<Config> = Schema.object({
    apiBaseUrl: Schema.string()
        .default("https://api.zvv.quest")
        .description("API地址"),
    defaultImageCount: Schema.number()
        .default(5)
        .min(1)
        .max(20)
        .description("默认图片数量"),
    timeout: Schema.number().default(10000).description("请求超时时间（毫秒）"),
});

export function apply(ctx: Context, config: Config) {
    ctx.command("vv <text> [n:number]", "搜索 VV 梗图")
        .example("vv 我喜欢你 5")
        .action(async ({ session }, text, n) => {
            if (!text || text.trim() === "") {
                return "请输入要搜索的文本";
            }

            // 如果未指定n，则使用配置中的默认值
            n = n || config.defaultImageCount;

            try {
                const response = await axios.get(
                    `${config.apiBaseUrl}/search`,
                    {
                        params: {
                            q: text,
                            n: n,
                        },
                        timeout: config.timeout,
                    }
                );

                if (
                    response.data.code === 200 &&
                    response.data.data?.length > 0
                ) {
                    const images = response.data.data;
                    // 创建一个图像消息数组
                    const elements = images.map((url) => h.image(url));
                    // 返回复合消息
                    return h("message", elements);
                } else {
                    return `没有找到与"${text}"相关的梗图`;
                }
            } catch (error: any) {
                console.error("搜索VV梗图出错:", error);
                return `搜索出错: ${error.message || "未知错误"}`;
            }
        });
}
