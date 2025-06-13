import { Context, Schema, Logger, h } from "koishi";
import axios from "axios";
import * as cheerio from "cheerio";
const logger = new Logger("match");

export const name = "match";

export interface Config {
    codeforces: {
        enabled: boolean;
        maxCount: number;
        timeout: number;
        command: string;
    };
    atcoder: {
        enabled: boolean;
        maxCount: number;
        timeout: number;
        command: string;
    };
    nowcoder: {
        enabled: boolean;
        maxCount: number;
        timeout: number;
        command: string;
    };
}

export const Config: Schema<Config> = Schema.object({
    codeforces: Schema.object({
        enabled: Schema.boolean()
            .default(true)
            .description("是否启用CodeForces比赛获取"),
        maxCount: Schema.number()
            .min(1)
            .max(10)
            .default(3)
            .description("获取的最大比赛数量"),
        timeout: Schema.number()
            .default(10000)
            .description("请求超时时间(毫秒)"),
        command: Schema.string().default("cf").description("触发命令名称"),
    }).description("CodeForces 配置"),

    atcoder: Schema.object({
        enabled: Schema.boolean()
            .default(true)
            .description("是否启用AtCoder比赛获取"),
        maxCount: Schema.number()
            .min(1)
            .max(10)
            .default(2)
            .description("获取的最大比赛数量"),
        timeout: Schema.number()
            .default(10000)
            .description("请求超时时间(毫秒)"),
        command: Schema.string().default("atc").description("触发命令名称"),
    }).description("AtCoder 配置"),

    nowcoder: Schema.object({
        enabled: Schema.boolean()
            .default(true)
            .description("是否启用牛客比赛获取"),
        maxCount: Schema.number()
            .min(1)
            .max(10)
            .default(3)
            .description("获取的最大比赛数量"),
        timeout: Schema.number()
            .default(20000)
            .description("请求超时时间(毫秒)"),
        command: Schema.string().default("nc").description("触发命令名称"),
    }).description("牛客网 配置"),
});

interface Contest {
    name: string;
    time: string;
    url: string;
}

export function apply(ctx: Context, config: Config) {
    if (config.codeforces.enabled) {
        ctx.command(config.codeforces.command, "获取最近的CF比赛信息").action(
            async () => {
                return await getCodeForcesContests(
                    config.codeforces.maxCount,
                    config.codeforces.timeout
                );
            }
        );
    }

    if (config.atcoder.enabled) {
        ctx.command(config.atcoder.command, "获取最近的AtCoder比赛信息").action(
            async () => {
                return await getAtCoderContests(
                    config.atcoder.maxCount,
                    config.atcoder.timeout
                );
            }
        );
    }

    if (config.nowcoder.enabled) {
        ctx.command(config.nowcoder.command, "获取最近的牛客网比赛信息").action(
            async () => {
                return await getNowcoderContests(
                    config.nowcoder.maxCount,
                    config.nowcoder.timeout
                );
            }
        );
    }
}

async function getCodeForcesContests(
    maxCount: number = 3,
    timeout: number = 10000
): Promise<string> {
    const contests: Contest[] = [];
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const url = "https://codeforces.com/api/contest.list?gym=false";
            const response = await axios.get(url, { timeout });

            if (response.data && response.data.result) {
                contests.length = 0;

                for (const contest of response.data.result) {
                    if (contest.phase !== "BEFORE") {
                        break;
                    }

                    const name = contest.name;
                    const time = new Date(contest.startTimeSeconds * 1000)
                        .toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        .replace(/\//g, "-");
                    const url = `https://codeforces.com/contest/${contest.id}`;

                    contests.push({ name, time, url });
                }

                contests.reverse();

                let msg = "";
                const count = Math.min(maxCount, contests.length);

                for (let i = 0; i < count; i++) {
                    const contest = contests[i];
                    msg +=
                        "比赛名称：" +
                        contest.name +
                        "\n" +
                        "比赛时间：" +
                        contest.time +
                        "\n" +
                        "比赛链接：" +
                        contest.url;

                    if (i < count - 1) {
                        msg += "\n\n";
                    }
                }

                return `找到最近的 ${count} 场CF比赛为：\n\n${msg}`;
            }

            throw new Error("Invalid API response");
        } catch (error) {
            logger.error(`获取CF比赛信息失败: ${error}`);
            retries++;

            if (retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
    }

    return "获取CF比赛信息失败，请稍后再试";
}

async function getAtCoderContests(
    maxCount: number = 2,
    timeout: number = 10000
): Promise<string> {
    const contests: Contest[] = [];
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const url = "https://atcoder.jp/contests/?lang=en";
            const response = await axios.get(url, { timeout });

            const $ = cheerio.load(response.data);
            const upcomingContestsTable = $("#contest-table-upcoming tbody tr");

            contests.length = 0;

            upcomingContestsTable.each((index, element) => {
                if (index < maxCount) {
                    const startTime = $(element)
                        .find("td:first-child time")
                        .attr("datetime");
                    let startTimeLocal = "";

                    if (startTime) {
                        const date = new Date(startTime);
                        date.setHours(date.getHours() - 1);
                        startTimeLocal = date
                            .toLocaleString("zh-CN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            .replace(/\//g, "-");
                    }

                    const name = $(element)
                        .find("td:nth-child(2) a")
                        .text()
                        .trim();
                    const url =
                        "https://atcoder.jp" +
                        $(element).find("td:nth-child(2) a").attr("href");

                    if (name && startTimeLocal && url) {
                        contests.push({ name, time: startTimeLocal, url });
                    }
                }
            });

            if (contests.length > 0) {
                let msg = "";

                for (let i = 0; i < contests.length; i++) {
                    const contest = contests[i];
                    msg +=
                        "比赛名称：" +
                        contest.name +
                        "\n" +
                        "比赛时间：" +
                        contest.time +
                        "\n" +
                        "比赛链接：" +
                        contest.url;

                    if (i < contests.length - 1) {
                        msg += "\n\n";
                    }
                }

                return `找到最近的 ${contests.length} 场AtCoder比赛为：\n\n${msg}`;
            }

            throw new Error("No contests found");
        } catch (error) {
            logger.error(`获取AtCoder比赛信息失败: ${error}`);
            retries++;

            if (retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
    }

    return "获取AtCoder比赛信息失败，请稍后再试";
}

async function getNowcoderContests(
    maxCount: number = 3,
    timeout: number = 20000
): Promise<string> {
    const contests: Contest[] = [];
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const now = new Date();
            const date = `${now.getFullYear()} - ${now.getMonth() + 1}`;
            const timestamp = Date.now();

            const url = `https://ac.nowcoder.com/acm/calendar/contest?token=&month=${date}&_=${timestamp}`;
            const headers = {
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            };

            const response = await axios.get(url, {
                headers,
                timeout,
            });

            if (
                response.data &&
                response.data.code === 0 &&
                response.data.msg === "OK"
            ) {
                contests.length = 0;

                for (const contest of response.data.data) {
                    if (contest.startTime >= timestamp) {
                        const name = contest.contestName;
                        const time = new Date(contest.startTime)
                            .toLocaleString("zh-CN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            .replace(/\//g, "-");
                        const url = contest.link;

                        contests.push({ name, time, url });
                    }
                }

                if (contests.length > 0) {
                    let msg = "";
                    const count = Math.min(maxCount, contests.length);

                    for (let i = 0; i < count; i++) {
                        const contest = contests[i];
                        msg +=
                            "比赛名称：" +
                            contest.name +
                            "\n" +
                            "比赛时间：" +
                            contest.time +
                            "\n" +
                            "比赛链接：" +
                            contest.url;

                        if (i < count - 1) {
                            msg += "\n\n";
                        }
                    }

                    return `找到最近的 ${count} 场牛客比赛为：\n\n${msg}`;
                }
            }

            throw new Error("Invalid API response");
        } catch (error) {
            logger.error(`获取牛客比赛信息失败: ${error}`);
            retries++;

            if (retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }
    }

    return "获取牛客比赛信息失败，请稍后再试";
}
