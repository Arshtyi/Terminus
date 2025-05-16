/**
 * 插件使用说明
 */
export const usage = `
## 命令说明
* \`ygo.update\` - 更新卡牌数据库（需要管理员权限）。
* \`ygo.random\` - 随机抽取一张游戏王卡牌并显示。
* \`随机一卡\` - 随机抽取卡牌的别名命令。

## 权限说明
* 更新卡牌数据库需要管理员权限（authority: 4）。
* 随机卡牌功能所有用户可用。

## 配置说明
* 卡牌数据文件存放在 \`config\` 目录中。
* 更新脚本位于 \`script\` 目录中。

## 说明
* 更新功能依赖于 [MDPro3 Cards](https://github.com/Arshtyi/MDPro3-Cards) 仓库。
* 请勿大量调用更新功能，以免给服务器造成负担。
`;
