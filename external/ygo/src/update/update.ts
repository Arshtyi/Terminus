import { exec } from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function update(): Promise<string> {
    try {
        // 获取脚本的路径
        const scriptPath = path.resolve(
            __dirname,
            "../../script/update_cards.sh"
        );

        // 确认脚本存在
        if (!(await fs.pathExists(scriptPath))) {
            throw new Error("更新脚本不存在");
        }

        // 执行脚本
        console.log("正在运行更新脚本...");
        const { stdout, stderr } = await execPromise(`bash ${scriptPath}`);

        if (stderr && !stderr.includes("更新完成")) {
            throw new Error(stderr);
        }

        console.log(stdout);

        // 从输出中提取处理的文件数量
        const match = stdout.match(/共处理了\s+(\d+)\s+个文件/);
        const count = match ? match[1] : "未知数量的";

        return `更新完成，共处理了 ${count} 个文件`;
    } catch (error) {
        console.error("更新失败:", error);
        return `更新失败: ${error.message}`;
    }
}
