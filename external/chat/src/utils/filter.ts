export function filterThinking(content: string): string {
    if (!content) return content;
    return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
