#!/bin/bash
export https_proxy=http://127.0.0.1:7897
export http_proxy=http://127.0.0.1:7897
export all_proxy=socks5://127.0.0.1:7897
REPO="Arshtyi/YuGiOh-Cards-Maker"
TMP_DIR="/media/arshtyi/Data/Program/Project/terminus/external/ygo/tmp"
TARGET_DIR="/media/arshtyi/Data/Program/Project/terminus/external/ygo/cfg/fig"
CARDS_FILES=("cards_0.tar.xz" "cards_1.tar.xz")
mkdir -p "$TMP_DIR"
mkdir -p "$TARGET_DIR"
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "错误: 找不到命令 $1，请先安装"
        exit 1
    fi
}
check_command curl
check_command tar
echo "清空目标目录 $TARGET_DIR..."
rm -rf "$TARGET_DIR"/*
mkdir -p "$TARGET_DIR"
echo "正在使用代理获取GitHub仓库最新release信息..."
RELEASE_INFO=$(curl -s -L https://api.github.com/repos/$REPO/releases/latest)
if [ $? -ne 0 ]; then
    echo "错误: 无法获取仓库release信息，请检查网络或代理设置"
    exit 1
fi
TAG=$(echo "$RELEASE_INFO" | grep -o '"tag_name": *"[^"]*"' | cut -d'"' -f4)
if [ -z "$TAG" ]; then
    echo "错误: 无法获取最新release的tag"
    exit 1
fi
echo "找到最新release: $TAG"
PROCESSED_FILES=0
for CARD_FILE in "${CARDS_FILES[@]}"; do
    DOWNLOAD_URL="https://github.com/$REPO/releases/download/$TAG/$CARD_FILE"
    DOWNLOAD_PATH="$TMP_DIR/$CARD_FILE"
    echo "正在使用代理下载 $CARD_FILE..."
    curl -L -o "$DOWNLOAD_PATH" "$DOWNLOAD_URL"
    if [ $? -ne 0 ] || [ ! -f "$DOWNLOAD_PATH" ] || [ ! -s "$DOWNLOAD_PATH" ]; then
        echo "错误: 无法下载 $CARD_FILE 或文件为空"
        exit 1
    fi
    echo "正在解压 $CARD_FILE 到 $TARGET_DIR..."
    tar -xf "$DOWNLOAD_PATH" -C "$TARGET_DIR"
    if [ $? -ne 0 ]; then
        echo "错误: 解压 $CARD_FILE 失败"
        exit 1
    fi
    PROCESSED_FILES=$((PROCESSED_FILES + 1))
    rm "$DOWNLOAD_PATH"
done
if [ $PROCESSED_FILES -eq 0 ]; then
    echo "错误: 没有成功处理任何文件"
    echo "正在列出仓库中可用的文件..."
    ASSETS=$(echo "$RELEASE_INFO" | grep -o '"name": *"[^"]*"' | cut -d'"' -f4)
    echo "仓库中可用的文件:"
    echo "$ASSETS"
    echo "请确认所需文件 cards_0.tar.xz 和 cards_1.tar.xz 是否存在于最新release中"
    exit 1
fi
rm -rf "$TMP_DIR"
echo "更新完成，成功处理 $PROCESSED_FILES 个文件，所有卡牌图片已解压到 $TARGET_DIR"
echo "图片总数: $(find "$TARGET_DIR" -type f -name "*.jpg" | wc -l) 张"
exit 0