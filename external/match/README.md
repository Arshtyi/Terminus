# koishi-plugin-match

[![npm](https://img.shields.io/npm/v/koishi-plugin-match?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-match)

-   获取近期编程比赛信息

## 功能

这个插件可以帮助你获取最近的编程比赛信息，支持以下平台：

-   CodeForces（CF）
-   AtCoder（ATC）
-   牛客（NC）

## 使用方法

安装插件后，你可以通过以下命令获取比赛信息：

-   `/cf` 或者 `cf` - 获取 CodeForces 比赛信息
-   `/atc` 或者 `atc` - 获取 AtCoder 比赛信息
-   `/nc` 或者 `nc` - 获取牛客网比赛信息

每个命令会返回比赛的名称、开始时间和参与链接。

## 配置说明

插件支持前端配置，你可以在 Koishi 控制台中设置以下配置项：

### CodeForces 配置

-   **是否启用**：启用或禁用 CodeForces 比赛获取功能
-   **最大比赛数量**：获取的最大比赛数量（1-10）
-   **请求超时时间**：API 请求的超时时间（毫秒）
-   **触发命令名称**：触发命令的名称，默认为 `cf`

### AtCoder 配置

-   **是否启用**：启用或禁用 AtCoder 比赛获取功能
-   **最大比赛数量**：获取的最大比赛数量（1-10）
-   **请求超时时间**：API 请求的超时时间（毫秒）
-   **触发命令名称**：触发命令的名称，默认为 `atc`

### 牛客网配置

-   **是否启用**：启用或禁用牛客比赛获取功能
-   **最大比赛数量**：获取的最大比赛数量（1-10）
-   **请求超时时间**：API 请求的超时时间（毫秒）
-   **触发命令名称**：触发命令的名称，默认为 `nc`

## Thx

-   [Match-Reminder](https://github.com/zhuhiki/nonebot_plugin_matchreminder)
