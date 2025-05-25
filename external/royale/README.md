# koishi-plugin-royale

[![npm](https://img.shields.io/npm/v/koishi-plugin-royale?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-royale)

Clash Royale 信息查询插件，支持在 WebUI 中配置。

## 功能

-   通过命令 `royale.playerinfo <tag>` 查询玩家个人信息
-   通过命令 `royale.claninfo <tag>` 查询部落信息
-   通过命令 `royale.setkey <key>` 设置 API 密钥（管理员权限）
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

### 获取 API 密钥

获取 Clash Royale API 密钥的方法：

1. 访问 [Clash Royale 开发者门户网站](https://developer.clashroyale.com)
2. 注册或登录您的账号
3. 在 My Account → Keys 页面创建一个新的 API 密钥
4. 设置 IP 地址白名单（必填项，可填写您服务器的 IP 地址）
5. 复制生成的 API 密钥到插件配置中

## 使用

在聊天中输入：

```
/royale.playerinfo #玩家标签
/royale.claninfo #部落标签
```

例如：

-   `/royale.playerinfo #CJ2L9PGLG` - 查询此标签玩家的信息
-   `/royale.claninfo #2LUGUPJ` - 查询此标签部落的信息

### 设置 API 密钥

管理员可以直接通过命令设置 API 密钥（无需进入 WebUI 配置）：

```
royale.setkey <密钥>
```

注意：通过命令设置的 API 密钥在重启后会失效，若需永久保存，请在 WebUI 中配置。

## API 密钥获取

访问 https://developer.clashroyale.com 注册并创建新的 API 密钥
