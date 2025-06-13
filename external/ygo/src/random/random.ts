import * as fs from "fs-extra";
import * as path from "path";
import { segment } from "koishi";
export interface RandomCardResult {
    imagePath: string;
    imageSegment: ReturnType<typeof segment.image>;
}
export async function randomPicture(): Promise<RandomCardResult> {
    const pictureDir = path.resolve(__dirname, "../../cfg/fig");
    console.log(`尝试从目录读取卡片: ${pictureDir}`);
    if (await fs.pathExists(pictureDir)) {
        try {
            const stats = await fs.stat(pictureDir);
            if (!stats.isDirectory()) {
                throw new Error(`${pictureDir} 不是一个目录`);
            }
            return await getRandomImageFromDir(pictureDir);
        } catch (error) {
            console.log(`在图片目录中读取图片出错: ${error.message}`);
            throw new Error(
                "读取卡片图片出错，请先使用 ygo.update 命令更新卡牌数据"
            );
        }
    } else {
        console.log(`目录 ${pictureDir} 不存在`);
        throw new Error(
            "卡片图片目录不存在，请先使用 ygo.update 命令更新卡牌数据"
        );
    }
}
async function getRandomImageFromDir(dir: string): Promise<RandomCardResult> {
    const files = await fs.readdir(dir);
    const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ext === ".jpg";
    });
    if (imageFiles.length === 0) {
        throw new Error(
            "卡片图片目录中没有图片，请先使用 ygo.update 命令更新卡牌数据"
        );
    }
    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    const randomImage = imageFiles[randomIndex];
    const imagePath = path.join(dir, randomImage);
    console.log(`随机选择的卡片图片: ${randomImage}`);
    const imageSegment = segment.image(imagePath);
    return {
        imagePath,
        imageSegment,
    };
}
