import axios from "axios";
import { PluginResponse, success, failure } from "./utils/response";

const BUILDINGS = [
    {
        buildingid: "1574231830%26T1",
        building: "T1",
    },
    {
        buildingid:
            "1574231833%26%E4%B8%93%E5%AE%B6%E5%85%AC%E5%AF%932%E5%8F%B7%E6%A5%BC",
        building: "T2",
    },
    {
        buildingid: "1574231835%26T3",
        building: "T3",
    },
    {
        buildingid:
            "1503975832%26%E5%87%A4%E5%87%B0%E5%B1%851%E5%8F%B7%E6%A5%BC",
        building: "S1",
    },
    {
        buildingid:
            "1503975890%26%E5%87%A4%E5%87%B0%E5%B1%852%E5%8F%B7%E6%A5%BC",
        building: "S2",
    },
    {
        buildingid:
            "1503975967%26S5%E5%87%A4%E5%87%B0%E5%B1%855%E5%8F%B7%E6%A5%BC",
        building: "S5",
    },
    {
        buildingid:
            "1503975980%26%E5%87%A4%E5%87%B0%E5%B1%856%E5%8F%B7%E6%A5%BC",
        building: "S6",
    },
    {
        buildingid:
            "1503975988%26S7%E5%87%A4%E5%87%B0%E5%B1%857%E5%8F%B7%E6%A5%BC",
        building: "S7",
    },
    {
        buildingid:
            "1503975995%26S8%E5%87%A4%E5%87%B0%E5%B1%858%E5%8F%B7%E6%A5%BC",
        building: "S8",
    },
    {
        buildingid:
            "1503976004%26%E5%87%A4%E5%87%B0%E5%B1%859%E5%8F%B7%E6%A5%BC",
        building: "S9",
    },
    {
        buildingid:
            "1503976037%26%E5%87%A4%E5%87%B0%E5%B1%8510%E5%8F%B7%E6%A5%BC",
        building: "S10",
    },
    {
        buildingid: "1599193777%26S11",
        building: "S11",
    },
    {
        buildingid: "1661835273%26B5%E5%8F%B7%E6%A5%BC",
        building: "B5",
    },
    {
        buildingid: "1661835249%26B1",
        building: "B1",
    },
    {
        buildingid: "1661835256%26B2",
        building: "B2",
    },
    {
        buildingid: "1693031698%26B9",
        building: "B9",
    },
    {
        buildingid: "1693031710%26%E9%98%85%E6%B5%B7%E5%B1%85B10%E6%A5%BC",
        building: "B10",
    },
];

export function buildingToId(building: string): string {
    for (const _building of BUILDINGS) {
        if (_building.building === building) {
            return _building.buildingid;
        }
    }
    console.error("错误的宿舍楼编号");
    return "";
}

export async function query(
    building: string,
    room: string,
    synjonesAuth: string
): Promise<PluginResponse> {
    if (!synjonesAuth || synjonesAuth.trim() === "") {
        return failure(
            "配置错误",
            "缺少有效的API密钥，请在插件配置中设置Synjones-Auth验证令牌"
        );
    }
    const HEADERS = {
        "User-Agent":
            "Mozilla/5.0 (Linux; Android 14; Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.39 Mobile Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://mcard.sdu.edu.cn",
        Referer: "https://mcard.sdu.edu.cn/charge-app/",
        "Synjones-Auth": synjonesAuth,
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Sec-Ch-Ua-Platform": "Android",
        "Sec-Ch-Ua":
            '"Android WebView";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?1",
        Accept: "application/json, text/plain, */*",
    };

    const buildingId = buildingToId(building);
    if (!buildingId) {
        return failure("错误的宿舍楼编号");
    }

    const data = `feeitemid=410&type=IEC&level=3&campus=%E9%9D%92%E5%B2%9B%E6%A0%A1%E5%8C%BA%26%E9%9D%92%E5%B2%9B%E6%A0%A1%E5%8C%BA&building=${buildingId}&room=${room}`;

    try {
        const response = await axios.post(
            "https://mcard.sdu.edu.cn/charge/feeitem/getThirdData",
            data,
            { headers: HEADERS }
        );

        console.log("响应数据结构:", JSON.stringify(response.data));

        if (
            !response.data ||
            !response.data.map ||
            !response.data.map.showData ||
            !response.data.map.showData["信息"]
        ) {
            console.error("返回数据结构不符合预期:", response.data);
            return failure("数据格式错误", "服务器返回的数据格式不符合预期");
        }

        try {
            const electricityInfo = response.data.map.showData["信息"];
            console.log("原始电量信息:", electricityInfo);

            const result = electricityInfo.substring(8);
            console.log("解析到的电量值:", result);
            const roomInfo = response.data.map.data;

            const returnValue = {
                success: true,
                message: result,
                data: {
                    electricity: result,
                    buildingName: roomInfo.buildingName || "",
                    room: roomInfo.room || "",
                    area: roomInfo.area || "青岛校区",
                    areaName: roomInfo.areaName || "青岛校区",
                },
            };
            console.log("query.ts 返回值:", JSON.stringify(returnValue));

            return returnValue;
        } catch (error) {
            console.error("处理电量数据时出错:", error);
            return failure("数据处理错误", "无法解析电量信息");
        }
    } catch (error) {
        console.error(error);
        return failure("查询失败");
    }
}
