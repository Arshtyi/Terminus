#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # 无颜色

# 定义变量
TEMP_DIR="/media/arshtyi/Data/Program/Project/terminus/external/ygo/temp"
TARGET_DIR="/media/arshtyi/Data/Program/Project/terminus/external/ygo/config/picture"
DOWNLOAD_URL="https://github.com/Arshtyi/MDPro3-Cards/releases/download/latest/cards.tar.xz"

# 代理设置 - 默认使用指定的代理设置
HTTP_PROXY_CUSTOM="${HTTP_PROXY:-http://127.0.0.1:7897}"
HTTPS_PROXY_CUSTOM="${HTTPS_PROXY:-http://127.0.0.1:7897}"
ALL_PROXY_CUSTOM="${ALL_PROXY:-socks5://127.0.0.1:7897}"
NO_PROXY_CUSTOM="${NO_PROXY:-localhost,127.0.0.1}"

# 显示时间戳函数
timestamp() {
    date +"%Y-%m-%d %H:%M:%S"
}

# 配置代理
setup_proxy() {
    # 检查是否已设置环境变量代理
    if [ -n "$HTTP_PROXY" ] || [ -n "$HTTPS_PROXY" ] || [ -n "$ALL_PROXY" ]; then
        echo -e "${CYAN}[$(timestamp)] [代理] ${NC}检测到系统代理设置"
        # 如果系统有环境变量，使用系统的设置
        HTTP_PROXY_CUSTOM="$HTTP_PROXY"
        HTTPS_PROXY_CUSTOM="$HTTPS_PROXY"
        ALL_PROXY_CUSTOM="$ALL_PROXY"
    else
        echo -e "${CYAN}[$(timestamp)] [代理] ${NC}使用脚本中配置的代理设置"
    fi
    
    # 导出代理环境变量供脚本使用
    export http_proxy="$HTTP_PROXY_CUSTOM"
    export HTTP_PROXY="$HTTP_PROXY_CUSTOM"
    echo -e "${CYAN}[$(timestamp)] [代理] ${NC}HTTP代理已设置为: $HTTP_PROXY_CUSTOM"
    
    export https_proxy="$HTTPS_PROXY_CUSTOM"
    export HTTPS_PROXY="$HTTPS_PROXY_CUSTOM"
    echo -e "${CYAN}[$(timestamp)] [代理] ${NC}HTTPS代理已设置为: $HTTPS_PROXY_CUSTOM"
    
    export all_proxy="$ALL_PROXY_CUSTOM"
    export ALL_PROXY="$ALL_PROXY_CUSTOM"
    echo -e "${CYAN}[$(timestamp)] [代理] ${NC}SOCKS代理已设置为: $ALL_PROXY_CUSTOM"
    
    if [ -n "$NO_PROXY_CUSTOM" ]; then
        export no_proxy="$NO_PROXY_CUSTOM"
        export NO_PROXY="$NO_PROXY_CUSTOM"
        echo -e "${CYAN}[$(timestamp)] [代理] ${NC}无代理列表: $NO_PROXY_CUSTOM"
    fi
}

# 设置代理
setup_proxy

# 确保临时目录存在
echo -e "${BLUE}[$(timestamp)] [INFO] ${NC}创建临时目录: ${TEMP_DIR}"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR" || { 
    echo -e "${RED}[$(timestamp)] [错误] ${NC}无法切换到临时目录" 
    exit 1
}

echo -e "${BLUE}[$(timestamp)] [INFO] ${NC}开始下载卡牌资源..."
echo -e "${YELLOW}[$(timestamp)] [下载] ${NC}从 ${DOWNLOAD_URL} 获取资源"

# 构建wget命令，添加代理选项和更多稳定性参数
WGET_CMD="wget --progress=bar:force:noscroll --timeout=120 --tries=3 --retry-connrefused --continue"

# 添加代理参数
WGET_CMD="$WGET_CMD --proxy=on"
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}下载将使用以下代理设置:"
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}HTTP: $HTTP_PROXY_CUSTOM"
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}HTTPS: $HTTPS_PROXY_CUSTOM" 
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}SOCKS: $ALL_PROXY_CUSTOM"

echo -e "${YELLOW}[$(timestamp)] [下载] ${NC}开始下载文件，这可能需要一些时间..."
echo -e "${YELLOW}[$(timestamp)] [下载] ${NC}文件较大，约1.7GB，请耐心等待..."

# 使用wget显示进度条，直接使用管道输出实时进度
$WGET_CMD "$DOWNLOAD_URL" -O cards.tar.xz 2>&1 | \
    while read line; do 
        echo -e "${YELLOW}[$(timestamp)] [下载] ${NC}$line"
    done

# 确保PIPESTATUS索引存在，否则设置默认值
wget_status=${PIPESTATUS[0]:-1}

# 检查变量是否为空或非数字
if [[ ! "$wget_status" =~ ^[0-9]+$ ]]; then
    wget_status=1
fi

if [ "$wget_status" -ne 0 ]; then
    echo -e "${RED}[$(timestamp)] [错误] ${NC}wget下载失败，返回状态码: $wget_status"
    echo -e "${YELLOW}[$(timestamp)] [下载] ${NC}尝试使用curl作为备用方法下载..."
    
    curl --connect-timeout 30 --retry 3 --retry-delay 5 -L --proxy "$HTTP_PROXY_CUSTOM" \
        -o cards.tar.xz "$DOWNLOAD_URL" 2>&1 | \
        while read line; do 
            echo -e "${YELLOW}[$(timestamp)] [下载] ${NC}$line"
        done
    
    # 确保PIPESTATUS索引存在，否则设置默认值
    curl_status=${PIPESTATUS[0]:-1}
    
    # 检查变量是否为空或非数字
    if [[ ! "$curl_status" =~ ^[0-9]+$ ]]; then
        curl_status=1
    fi
    
    if [ "$curl_status" -ne 0 ]; then
        echo -e "${RED}[$(timestamp)] [错误] ${NC}curl下载也失败，返回状态码: $curl_status"
        exit 1
    fi
fi

# 检查下载的文件大小
if [ -f "cards.tar.xz" ]; then
    file_size=$(stat -c%s "cards.tar.xz" 2>/dev/null || echo 0)
    
    # 确保file_size是数字
    if [[ ! "$file_size" =~ ^[0-9]+$ ]]; then
        file_size=0
    fi
    
    if [ "$file_size" -eq 0 ]; then
        echo -e "${RED}[$(timestamp)] [错误] ${NC}下载的文件大小为零字节，下载失败"
        exit 1
    else
        echo -e "${GREEN}[$(timestamp)] [成功] ${NC}下载完成，文件大小：$file_size 字节"
    fi
else
    echo -e "${RED}[$(timestamp)] [错误] ${NC}文件不存在，下载失败"
    exit 1
fi

echo -e "${BLUE}[$(timestamp)] [INFO] ${NC}开始解压文件..."
echo -e "${YELLOW}[$(timestamp)] [解压] ${NC}对于大文件解压可能需要一些时间，请耐心等待..."

# 验证文件是否为有效的tar.xz文件
xz -t cards.tar.xz 2>/dev/null
XZ_STATUS=$?
if [ "$XZ_STATUS" -ne 0 ]; then
    echo -e "${RED}[$(timestamp)] [错误] ${NC}文件 cards.tar.xz 不是有效的xz压缩文件"
    echo -e "${YELLOW}[$(timestamp)] [解压] ${NC}尝试使用普通tar解压..."
    tar -xf cards.tar.xz 2>&1 || {
        echo -e "${RED}[$(timestamp)] [错误] ${NC}所有解压方法均失败"
        exit 1
    }
else
    # 使用管道组合先解压xz然后解包tar
    xz -dc cards.tar.xz | tar -x 2>&1 | \
        while read line; do 
            echo -e "${YELLOW}[$(timestamp)] [解压] ${NC}$line"
        done
    
    # 确保PIPESTATUS索引存在，否则设置默认值为0（表示成功）
    XZ_PIPE_STATUS=${PIPESTATUS[0]:-0}
    TAR_PIPE_STATUS=${PIPESTATUS[1]:-0}
    
    # 先检查变量是否为空或非数字，如果是则设置为1（表示错误）
    if [[ ! "$XZ_PIPE_STATUS" =~ ^[0-9]+$ ]]; then
        XZ_PIPE_STATUS=1
    fi
    
    if [[ ! "$TAR_PIPE_STATUS" =~ ^[0-9]+$ ]]; then
        TAR_PIPE_STATUS=1
    fi
    
    # 现在安全地进行数值比较
    if [ "$XZ_PIPE_STATUS" -ne 0 ] || [ "$TAR_PIPE_STATUS" -ne 0 ]; then
        echo -e "${RED}[$(timestamp)] [错误] ${NC}解压失败"
        exit 1
    else
        echo -e "${GREEN}[$(timestamp)] [成功] ${NC}解压完成"
    fi
fi

# 确保目标目录存在
echo -e "${BLUE}[$(timestamp)] [INFO] ${NC}创建目标目录: ${TARGET_DIR}"
mkdir -p "$TARGET_DIR"

echo -e "${BLUE}[$(timestamp)] [INFO] ${NC}开始处理文件..."
counter=1
total_files=$(find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.png" \) | wc -l)

# 确保total_files是数字
if [[ ! "$total_files" =~ ^[0-9]+$ ]]; then
    echo -e "${YELLOW}[$(timestamp)] [警告] ${NC}无法确定文件数量，设为0"
    total_files=0
fi

if [ "$total_files" -eq 0 ]; then
    echo -e "${RED}[$(timestamp)] [警告] ${NC}未找到任何图片文件"
    exit 1
fi

echo -e "${YELLOW}[$(timestamp)] [处理] ${NC}共发现 ${total_files} 个图片文件"

# 查找并重命名图片文件
find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.png" \) | while read file; do
    extension="${file##*.}"
    filename=$(basename "$file")
    cp "$file" "$TARGET_DIR/$counter.$extension"
    
    # 每10个文件显示一次进度
    # 确保安全的算术运算
    if [ "$counter" -gt 0 ] && [ "$total_files" -gt 0 ] && { [ $((counter % 10)) -eq 0 ] || [ "$counter" -eq 1 ] || [ "$counter" -eq "$total_files" ]; }; then
        percent=$((counter * 100 / total_files))
        echo -e "${YELLOW}[$(timestamp)] [进度] ${NC}$counter/$total_files ($percent%) - 处理: $filename -> $counter.$extension"
    fi
    
    counter=$((counter + 1))
done

# 计算处理了多少文件
processed=$((counter - 1))

# 清理临时文件
echo -e "${BLUE}[$(timestamp)] [INFO] ${NC}清理临时文件..."
rm -f cards.tar.xz
# 删除所有JPG和PNG文件，但不删除脚本和其他重要文件
find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.png" \) -delete

# 输出代理使用情况总结
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}本次更新使用了以下网络代理:"
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}HTTP: $HTTP_PROXY_CUSTOM"
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}HTTPS: $HTTPS_PROXY_CUSTOM"
echo -e "${CYAN}[$(timestamp)] [代理] ${NC}SOCKS: $ALL_PROXY_CUSTOM"

echo -e "${GREEN}[$(timestamp)] [完成] ${NC}更新完成，共处理了 ${processed} 个文件"
exit 0