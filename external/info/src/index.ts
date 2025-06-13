import { Context, Schema } from "koishi";
import * as si from "systeminformation";

export const name = "info";

export interface Config {
    updateInterval: number;
    decimals: number;
    showGpu: boolean;
    showNetwork: boolean;
}

export const Config: Schema<Config> = Schema.object({
    updateInterval: Schema.number()
        .description("更新系统信息的间隔时间（毫秒）")
        .default(5000),
    decimals: Schema.number().description("小数点后的位数").default(2),
    showGpu: Schema.boolean().description("是否显示 GPU 信息").default(true),
    showNetwork: Schema.boolean().description("是否显示网络信息").default(true),
});

export function apply(ctx: Context, config: Config) {
    const formatNumber = (num: number) => num.toFixed(config.decimals);
    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1024 * 1024) return formatNumber(bytes / 1024) + " KB";
        else if (bytes < 1024 * 1024 * 1024)
            return formatNumber(bytes / (1024 * 1024)) + " MB";
        else return formatNumber(bytes / (1024 * 1024 * 1024)) + " GB";
    };
    const formatUptime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${days}天 ${hours}小时 ${minutes}分钟 ${secs}秒`;
    };
    async function getCpuInfo() {
        try {
            const [cpuData, currentLoad] = await Promise.all([
                si.cpu(),
                si.currentLoad(),
            ]);

            return [
                `## CPU信息`,
                `品牌：${cpuData.manufacturer} ${cpuData.brand}`,
                `型号：${cpuData.model}`,
                `物理核心：${cpuData.physicalCores}`,
                `逻辑核心：${cpuData.cores}`,
                `速度：${cpuData.speed} GHz`,
                `使用率：${formatNumber(currentLoad.currentLoad)}%`,
                `用户占用：${formatNumber(currentLoad.currentLoadUser)}%`,
                `系统占用：${formatNumber(currentLoad.currentLoadSystem)}%`,
                `空闲率：${formatNumber(currentLoad.currentLoadIdle)}%`,
            ].join("\n");
        } catch (error) {
            ctx.logger("info").error("获取CPU信息失败", error);
            return "## CPU信息\n获取失败：" + error.message;
        }
    }
    async function getMemoryInfo() {
        try {
            const memData = await si.mem();
            const totalMemory = formatBytes(memData.total);
            const usedMemory = formatBytes(memData.used);
            const freeMemory = formatBytes(memData.free);
            const usedPercent = formatNumber(
                (memData.used / memData.total) * 100
            );

            return [
                `## 内存信息`,
                `总内存：${totalMemory}`,
                `已使用：${usedMemory} (${usedPercent}%)`,
                `空闲内存：${freeMemory}`,
                `活跃内存：${formatBytes(memData.active)}`,
                `缓冲/缓存：${formatBytes(memData.buffcache)}`,
                `交换内存总量：${formatBytes(memData.swaptotal)}`,
                `交换内存已用：${formatBytes(memData.swapused)}`,
                `交换内存空闲：${formatBytes(memData.swapfree)}`,
            ].join("\n");
        } catch (error) {
            ctx.logger("info").error("获取内存信息失败", error);
            return "## 内存信息\n获取失败：" + error.message;
        }
    }
    async function getGpuInfo() {
        if (!config.showGpu) return null;

        try {
            const gpuData = await si.graphics();
            if (!gpuData.controllers || gpuData.controllers.length === 0) {
                return "## GPU信息\n未检测到 GPU";
            }

            const gpuInfoList = gpuData.controllers.map((gpu, index) => {
                const vendor = gpu.vendor || "未知厂商";
                const model = gpu.model || "未知型号";
                const vram = gpu.vram
                    ? formatBytes(gpu.vram * 1024 * 1024)
                    : "未知";
                const memoryTotal = gpu.memoryTotal
                    ? formatBytes(gpu.memoryTotal * 1024 * 1024)
                    : "未知";
                const memoryUsed = gpu.memoryUsed
                    ? formatBytes(gpu.memoryUsed * 1024 * 1024)
                    : "未知";
                const memoryFree = gpu.memoryFree
                    ? formatBytes(gpu.memoryFree * 1024 * 1024)
                    : "未知";
                const usage = gpu.utilizationGpu
                    ? `${formatNumber(gpu.utilizationGpu)}%`
                    : "未知";

                return [
                    `### GPU ${index + 1}`,
                    `厂商：${vendor}`,
                    `型号：${model}`,
                    `显存：${vram}`,
                    `显存总量：${memoryTotal}`,
                    `显存已用：${memoryUsed}`,
                    `显存空闲：${memoryFree}`,
                    `GPU使用率：${usage}`,
                    `驱动版本：${gpu.driverVersion || "未知"}`,
                ].join("\n");
            });

            return [`## GPU信息`, ...gpuInfoList].join("\n\n");
        } catch (error) {
            ctx.logger("info").error("获取GPU信息失败", error);
            return "## GPU信息\n获取失败：" + error.message;
        }
    }

    async function getSystemInfo() {
        try {
            const [osInfo, time] = await Promise.all([si.osInfo(), si.time()]);

            const currentDate = new Date(time.current);

            return [
                `## 系统信息`,
                `当前时间：${currentDate.toLocaleString()}`,
                `操作系统：${osInfo.platform} ${osInfo.distro} ${osInfo.release} ${osInfo.arch}`,
                `主机名：${osInfo.hostname}`,
                `内核：${osInfo.kernel}`,
                `运行时间：${formatUptime(time.uptime * 1000)}`,
                `时区：${time.timezone} (${time.timezoneName})`,
                `UEFI：${osInfo.uefi ? "是" : "否"}`,
            ].join("\n");
        } catch (error) {
            ctx.logger("info").error("获取系统信息失败", error);
            return "## 系统信息\n获取失败：" + error.message;
        }
    }

    async function getDiskInfo() {
        try {
            const fsSize = await si.fsSize();

            if (!fsSize || fsSize.length === 0) {
                return "## 磁盘信息\n未检测到磁盘";
            }

            const diskInfoList = fsSize
                .filter((fs) => fs.mount)
                .map((fs) => {
                    const usedPercent = formatNumber((fs.used / fs.size) * 100);
                    return `${fs.mount}: ${formatBytes(
                        fs.size
                    )} (已用 ${usedPercent}%, 剩余 ${formatBytes(
                        fs.available
                    )})`;
                })
                .join("\n");

            return [`## 磁盘信息`, diskInfoList].join("\n");
        } catch (error) {
            ctx.logger("info").error("获取磁盘信息失败", error);
            return "## 磁盘信息\n获取失败：" + error.message;
        }
    }

    async function getNetworkInfo() {
        if (!config.showNetwork) return null;

        try {
            const [networkInterfaces, networkStats] = await Promise.all([
                si.networkInterfaces(),
                si.networkStats(),
            ]);

            if (!networkInterfaces || networkInterfaces.length === 0) {
                return "## 网络信息\n未检测到网络接口";
            }

            const interfacesList = networkInterfaces
                .filter((iface) => iface.ifaceName)
                .map((iface) => {
                    const stats = networkStats.find(
                        (stat) => stat.iface === iface.ifaceName
                    );

                    return [
                        `### ${iface.ifaceName}`,
                        `IP地址：${iface.ip4 || "未分配"}`,
                        `MAC地址：${iface.mac || "未知"}`,
                        `状态：${iface.operstate || "未知"}`,
                        `类型：${iface.type || "未知"}`,
                        `速度：${iface.speed ? iface.speed + " Mbps" : "未知"}`,
                        stats ? `已接收：${formatBytes(stats.rx_bytes)}` : null,
                        stats ? `已发送：${formatBytes(stats.tx_bytes)}` : null,
                    ]
                        .filter(Boolean)
                        .join("\n");
                })
                .join("\n\n");

            return [`## 网络信息`, interfacesList].join("\n\n");
        } catch (error) {
            ctx.logger("info").error("获取网络信息失败", error);
            return "## 网络信息\n获取失败：" + error.message;
        }
    }

    ctx.command("info", "获取系统所有信息（CPU、内存、系统等）").action(
        async ({ session }) => {
            try {
                const currentDate = new Date();

                const [
                    cpuInfo,
                    memoryInfo,
                    gpuInfo,
                    systemInfo,
                    diskInfo,
                    networkInfo,
                ] = await Promise.all([
                    getCpuInfo(),
                    getMemoryInfo(),
                    getGpuInfo(),
                    getSystemInfo(),
                    getDiskInfo(),
                    getNetworkInfo(),
                ]);

                const sections = [
                    `# 系统资源使用情况 (${currentDate.toLocaleString()})`,
                    cpuInfo,
                    "",
                    memoryInfo,
                    "",
                    gpuInfo,
                    "",
                    systemInfo,
                    "",
                    diskInfo,
                    "",
                    networkInfo,
                ].filter(Boolean);

                return sections.join("\n");
            } catch (error) {
                ctx.logger("info").error(error);
                return "获取系统信息失败：" + error.message;
            }
        }
    );
}
