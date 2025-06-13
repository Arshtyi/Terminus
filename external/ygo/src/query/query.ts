import * as fs from "fs-extra";
import * as path from "path";
import { segment } from "koishi";
import type { RandomCardResult } from "../random/random";

export async function queryCardById(cardId: string): Promise<RandomCardResult> {
    const pictureDir = path.resolve(__dirname, "../../cfg/fig");
    if (!(await fs.pathExists(pictureDir))) {
        throw new Error(
            "卡片图片目录不存在，请先使用 ygo.update 命令更新卡牌数据"
        );
    }
    const stats = await fs.stat(pictureDir);
    if (!stats.isDirectory()) {
        throw new Error(`${pictureDir} 不是一个目录`);
    }
    const files = await fs.readdir(pictureDir);
    const imageFiles = files.filter(
        (file) => path.extname(file).toLowerCase() === ".jpg"
    );
    if (imageFiles.length === 0) {
        throw new Error(
            "卡片图片目录中没有图片，请先使用 ygo.update 命令更新卡牌数据"
        );
    }
    const exactMatch = imageFiles.find((file) => {
        const fileName = path.basename(file, ".jpg");
        return fileName === cardId;
    });
    if (exactMatch) {
        const imagePath = path.join(pictureDir, exactMatch);
        console.log(`找到卡片ID: ${cardId}，对应图片: ${exactMatch}`);
        return {
            imagePath,
            imageSegment: segment.image(imagePath),
        };
    }
    throw new Error(`未找到ID为 ${cardId} 的卡片图片`);
}
