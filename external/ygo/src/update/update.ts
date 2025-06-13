import { exec } from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import { promisify } from "util";
import { formatResponse, success, failure } from "../utils/response";
import { Element } from "koishi";
const execPromise = promisify(exec);
export async function update(): Promise<string | Element> {
    try {
        const scriptPath = path.resolve(
            __dirname,
            "../../script/update_cards.sh"
        );
        if (!(await fs.pathExists(scriptPath))) {
            console.error("更新脚本不存在:", scriptPath);
            return formatResponse(failure("更新失败", "更新脚本不存在"));
        }
        try {
            await fs.chmod(scriptPath, 0o755);
        } catch (error) {
            console.warn("无法设置脚本执行权限:", error);
            // 继续执行，因为可能已经有执行权限
        }
        console.log("正在运行更新脚本...");
        const { stdout, stderr } = await execPromise(`bash ${scriptPath}`);
        const successInStdout =
            stdout.includes("更新完成") || stdout.includes("成功处理");
        const hasCurlProgress =
            stderr.includes("% Total") &&
            stderr.includes("% Received") &&
            stderr.includes("Dload");
        const hasRealError =
            stderr.includes("错误:") ||
            stderr.includes("失败") ||
            stderr.includes("Error");
        if (!successInStdout && hasRealError) {
            console.error("更新脚本执行出错，发现真正错误");
            const limitedError =
                stderr.length > 500
                    ? stderr.substring(0, 500) + "...(错误信息过长，已截断)"
                    : stderr;
            return formatResponse(failure("更新失败", limitedError));
        }
        if (hasCurlProgress && !hasRealError) {
            console.log("检测到curl下载进度信息，但未发现真正错误，继续处理");
        }
        const match = stdout.match(/更新完成，成功处理\s+(\d+)\s+个文件/);
        const oldFormatMatch =
            !match && stdout.match(/更新完成，共处理了\s+(\d+)\s+个文件/);
        const timestampMatch =
            !match &&
            !oldFormatMatch &&
            stdout.match(
                /\[完成\].*?更新完成，(成功|共)处理(了)?\s+(\d+)\s+个文件/
            );
        const count = match
            ? match[1]
            : oldFormatMatch
            ? oldFormatMatch[1]
            : timestampMatch
            ? timestampMatch[3]
            : "未知数量的";
        const imageCountMatch = stdout.match(/图片总数:\s+(\d+)\s+张/);
        const imageCount = imageCountMatch ? imageCountMatch[1] : null;
        const resultMessage = `更新完成，共处理了 ${count} 个文件${
            imageCount ? `，包含 ${imageCount} 张图片` : ""
        }`;
        console.log(resultMessage);
        return formatResponse(success(resultMessage));
    } catch (error) {
        console.error("更新过程中发生错误:", error);
        return formatResponse(failure("更新失败", error.message));
    }
}
