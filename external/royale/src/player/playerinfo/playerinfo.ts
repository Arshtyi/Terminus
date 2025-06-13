import axios from "axios";
import { formatResponse, success, failure } from "../../utils/response";

const API_URL = "https://api.clashroyale.com/v1/players/%23";

export async function playerinfo(tag: string, apiKey: string): Promise<string> {
    if (!tag || tag.trim() === "") {
        return formatResponse(failure("参数不足", "请输入玩家tag"));
    }

    if (!apiKey || apiKey.trim() === "") {
        return formatResponse(
            failure(
                "配置错误",
                "未设置API密钥，请在插件配置中设置 Clash Royale API密钥 (可从 https://developer.clashroyale.com 申请)"
            )
        );
    }

    try {
        tag = tag.trim();
        if (tag.startsWith("#")) {
            tag = tag.substring(1);
        }
        const response = await axios.get(`${API_URL}${tag}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
            },
        });

        const player = response.data;

        const playerData = formatPlayerInfo(player);
        return formatResponse(success(`玩家 #${tag} 的信息`, playerData));
    } catch (error) {
        console.error("获取玩家信息失败:", error);

        if (axios.isAxiosError(error) && error.response) {
            // API错误处理
            if (error.response.status === 404) {
                return formatResponse(
                    failure(
                        "查询失败",
                        `找不到玩家，请检查tag是否正确: #${tag}`
                    )
                );
            } else if (error.response.status === 403) {
                return formatResponse(
                    failure(
                        "查询失败",
                        "访问API失败，请检查API密钥是否正确或是否已授权"
                    )
                );
            } else {
                return formatResponse(
                    failure(
                        "查询失败",
                        `错误码: ${error.response.status}, 请稍后再试`
                    )
                );
            }
        }

        return formatResponse(
            failure("查询失败", "查询玩家信息时发生未知错误，请稍后再试")
        );
    }
}

/**
 * 计算胜率百分比
 * @param wins 胜利场次
 * @param losses 失败场次
 * @returns 胜率百分比字符串
 */
function calculateWinRate(wins: number, losses: number): string {
    const totalGames = wins + losses;
    if (totalGames === 0) return "无记录";

    const winRate = (wins / totalGames) * 100;
    return `${winRate.toFixed(2)}%`;
}

/**
 * 计算三冠率百分比
 * @param threeCrownWins 三冠胜利场次
 * @param wins 胜利总场次
 * @returns 三冠率百分比字符串
 */
function calculateThreeCrownRate(threeCrownWins: number, wins: number): string {
    if (wins === 0) return "0.00%";

    const threeCrownRate = (threeCrownWins / wins) * 100;
    return `${threeCrownRate.toFixed(2)}%`;
}

function formatPlayerInfo(player: any): string {
    // 计算badges总数
    const badgesCount = player.badges?.length || 0;
    // 提取标签（不含#符号）用于链接
    const tagForLink = player.tag.startsWith("#")
        ? player.tag.substring(1)
        : player.tag;
    // 提取部落标签（如果有部落）用于链接
    const clanTagForLink = player.clan?.tag
        ? player.clan.tag.startsWith("#")
            ? player.clan.tag.substring(1)
            : player.clan.tag
        : "";

    return `
【玩家信息】
名称: ${player.name}
标签: ${player.tag}
链接: https://royaleapi.com/player/${tagForLink}
奖杯: ${player.trophies}
最高奖杯: ${player.bestTrophies}
等级: ${player.expLevel}
竞技场: ${player.arena?.name || "未知"}
${player.clan ? `部落: ${player.clan.name} (${player.clan.tag})` : "未加入部落"}
${player.clan ? `部落链接: https://royaleapi.com/clan/${clanTagForLink}` : ""}
${player.role ? `部落角色: ${player.role}` : ""}

【战绩统计】
胜利场次: ${player.wins || 0}
失败场次: ${player.losses || 0}
三冠胜利: ${player.threeCrownWins || 0}
胜率: ${calculateWinRate(player.wins || 0, player.losses || 0)}
三冠率: ${calculateThreeCrownRate(player.threeCrownWins || 0, player.wins || 0)}

【挑战赛】
挑战赛获得卡牌: ${player.challengeCardsWon || 0}
挑战赛最高胜场: ${player.challengeMaxWins || 0}

【锦标赛】
锦标赛获得卡牌: ${player.tournamentCardsWon || 0}
锦标赛对战次数: ${player.tournamentBattleCount || 0}

【部落互动】
捐献次数: ${player.donations || 0}
接收捐献: ${player.donationsReceived || 0}
总捐献数: ${player.totalDonations || 0}

【成就徽章】
徽章总数: ${badgesCount}
`.trim();
}
