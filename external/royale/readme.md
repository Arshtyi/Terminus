# koishi-plugin-royale

[![npm](https://img.shields.io/npm/v/koishi-plugin-royale?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-royale)

Clash Royale 信息查询插件，支持在 WebUI 中配置。

## 功能

-   通过命令 `royale.playerinfo <tag>` 查询玩家个人信息
-   通过命令 `royale.claninfo <tag>` 查询部落信息
-   支持在 Koishi WebUI 中配置 API 密钥
-   提供友好的前端配置界面

## 安装

```bash
npm install koishi-plugin-royale
# 或通过Koishi插件市场安装
```

## 配置

在 Koishi WebUI 中，可以配置以下参数：

-   **apiKey**: Clash Royale API 密钥，用于访问官方 API

## 使用

在聊天中输入：

```
/royale.playerinfo #玩家标签
/royale.claninfo #部落标签
```

例如：

-   `/royale.playerinfo #CJ2L9PGLG` - 查询此标签玩家的信息
-   `/royale.claninfo #2LUGUPJ` - 查询此标签部落的信息

## API 密钥获取

访问 https://developer.clashroyale.com 注册并创建新的 API 密钥
