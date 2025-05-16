# koishi-plugin-equery

[![npm](https://img.shields.io/npm/v/koishi-plugin-equery?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-equery)

山东大学青岛校区宿舍剩余电量查询插件。

## 功能

-   通过命令 `equery <building> <room>` 查询山东大学青岛校区宿舍剩余电量
-   支持在 Koishi WebUI 中配置密钥

## 安装

```bash
npm install koishi-plugin-equery
# 或通过Koishi插件市场安装
```

## 配置

在 Koishi WebUI 中，可以配置以下参数：

-   **apiKey**: 验证令牌，用于访问电量查询 API

## 使用

在聊天中输入：

```
equery <宿舍楼号> <房间号>
```

例如：

-   `equery S1 A101` - 查询 S1 宿舍楼 A101 房间的电量

## Thx

-   [SDU-QD-Electricity-Query-Script](https://github.com/Dregen-Yor/SDU-QD-Electricity-Query-Script)
