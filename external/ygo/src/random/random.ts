import * as fs from "fs-extra";
import * as path from "path";
import { Context, segment } from "koishi";
import { formatResponse, success, failure } from "../utils/response";

/**
 * 从指定目录中随机选择一张图片
 * @returns 随机图片的路径和消息段
 */
export async function randomPicture(): Promise<{
    imagePath: string;
    imageSegment: any; // 修改为any类型，因为segment.image返回Element类型
}> {
    try {
        // 图片目录路径
        const pictureDir = path.resolve(__dirname, "../../config/picture");

        // 确保目录存在
        if (!(await fs.pathExists(pictureDir))) {
            throw new Error(
                "卡片图片目录不存在，请先使用 ygo.update 命令更新卡牌数据"
            );
        }

        // 读取目录中的所有文件
        const files = await fs.readdir(pictureDir);

        // 过滤出图片文件（jpg和png）
        const imageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ext === ".jpg" || ext === ".png";
        });

        if (imageFiles.length === 0) {
            throw new Error(
                "卡片图片目录中没有图片，请先使用 ygo.update 命令更新卡牌数据"
            );
        }

        // 随机选择一个图片
        const randomIndex = Math.floor(Math.random() * imageFiles.length);
        const randomImage = imageFiles[randomIndex];

        // 构建完整的图片路径
        const imagePath = path.join(pictureDir, randomImage);

        // 创建图片消息段
        const imageSegment = segment.image(imagePath);

        return {
            imagePath,
            imageSegment,
        };
    } catch (error) {
        console.error("获取随机卡片失败:", error);
        throw error; // 继续抛出错误，让上层函数处理
    }
}
