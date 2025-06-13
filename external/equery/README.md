# koishi-plugin-equery

[![npm](https://img.shields.io/npm/v/koishi-plugin-equery?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-equery)

山东大学青岛校区宿舍剩余电量查询插件。

## 功能

-   通过命令 `equery <building> <room>` 查询山东大学青岛校区宿舍剩余电量（因为南区北区电量的单位不同，就不写了)
-   在 Koishi WebUI 中配置密钥

## 配置

在 Koishi WebUI 中，可以配置以下参数：

-   **apiKey**: 验证令牌（Synjones-Auth），用于访问电量查询 API

## Thx

-   [SDU-QD-Electricity-Query-Script](https://github.com/Dregen-Yor/SDU-QD-Electricity-Query-Script)
