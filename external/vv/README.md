# koishi-plugin-vv

[![npm](https://img.shields.io/npm/v/koishi-plugin-vv?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-vv)

输出 VV 梗图的 Koishi 插件，支持在 WebUI 中配置。

## 功能

-   通过命令 `vv <文本>` 搜索并展示相关的 VV 梗图
-   可指定返回图片数量
-   支持在 Koishi WebUI 中配置 API 地址、默认图片数量、请求超时等参数
-   提供友好的前端配置界面

## 安装

```bash
npm install koishi-plugin-vv
# 或通过Koishi插件市场安装
```

## 使用

在聊天中输入以下命令：

-   `vv <文本>` - 搜索与文本相关的梗图（默认返回 5 张）
-   `vv <文本> <数量>` - 搜索与文本相关的梗图，并指定返回数量

例如：

-   `vv 我喜欢你` - 搜索"我喜欢你"相关的梗图
-   `vv 学习 3` - 搜索"学习"相关的梗图，返回 3 张

## 配置

在 Koishi WebUI 中，可以配置以下参数：

-   **apiBaseUrl**: API 基础 URL，默认为 `https://api.zvv.quest`
-   **defaultImageCount**: 默认返回的图片数量，默认为 `5`
-   **timeout**: API 请求超时时间(毫秒)，默认为 `10000`

## Thx

-   [VV](https://github.com/MemeMeow-Studio/MemeMeow)
