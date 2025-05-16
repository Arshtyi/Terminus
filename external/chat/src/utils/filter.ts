/**
 * 过滤AI回复中的思考部分
 * 去除 <think>...</think> 标签之间的内容
 * @param content AI回复的原始内容
 * @returns 过滤后的内容
 */
export function filterThinking(content: string): string {
    // 如果内容为空，直接返回
    if (!content) return content;

    // 使用正则表达式移除<think>...</think>标签及其内容
    return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
