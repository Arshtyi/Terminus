/**
 * 插件使用说明
 */
export const usage = `
## 命令说明
* \`ygo.update\` - 更新卡牌数据库（需要管理员权限）。
* \`ygo.random\` - 随机抽取一张游戏王卡牌并显示。
* \`ygo.query <id>\` - 通过ID查询指定的游戏王卡牌。

## 权限说明
* 更新卡牌数据库需要管理员权限（authority: 4）。
* 随机卡牌和查询卡牌功能所有用户可用。

## 配置说明
* 卡牌数据文件存放在 \`cfg/fig\` 目录中。
* 更新脚本位于 \`script\` 目录中。

## 说明
* 更新功能依赖于 [YuGiOh-Cards-Maker](https://github.com/Arshtyi/YuGiOh-Cards-Maker) 仓库。
* 请勿大量调用更新功能，以免给服务器造成负担。
`;
