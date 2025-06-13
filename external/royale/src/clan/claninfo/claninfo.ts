import axios from "axios";
import { formatResponse, success, failure } from "../../utils/response";

const API_URL = "https://api.clashroyale.com/v1/clans/%23";

export async function claninfo(tag: string, apiKey: string): Promise<string> {
    if (!tag || tag.trim() === "") {
        return formatResponse(failure("参数不足", "请输入部落tag"));
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

        const clan = response.data;
        const clanData = formatClanInfo(clan);
        return formatResponse(success(`部落 #${tag} 的信息`, clanData));
    } catch (error) {
        console.error("获取部落信息失败:", error);

        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 404) {
                return formatResponse(
                    failure(
                        "查询失败",
                        `找不到部落，请检查tag是否正确: #${tag}`
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
            failure("查询失败", "查询部落信息时发生未知错误，请稍后再试")
        );
    }
}

function formatClanInfo(clan: any): string {
    const memberCount = clan.members || 0;
    const tagForLink = clan.tag.startsWith("#")
        ? clan.tag.substring(1)
        : clan.tag;
    return `
【部落信息】
名称: ${clan.name}
标签: ${clan.tag}
链接: https://royaleapi.com/clan/${tagForLink}
描述: ${clan.description || "无描述"}
类型: ${getClanType(clan.type)}
成员数量: ${memberCount}/50
奖杯要求: ${clan.requiredTrophies || 0}
部落奖杯: ${clan.clanScore || 0}
部落战奖杯: ${clan.clanWarTrophies || 0}
每周捐献: ${clan.donationsPerWeek || 0}
`.trim();
}

// 转换部落类型为中文
function getClanType(type: string): string {
    const typeMap: Record<string, string> = {
        open: "开放",
        inviteOnly: "仅邀请",
        closed: "关闭",
    };

    return typeMap[type] || type;
}
