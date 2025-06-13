/**
 * 插件使用说明
 */
export const usage = `
## 命令说明
* \`royale.playerinfo <tag>\` - 查询 Clash Royale 玩家个人信息。
* \`royale.claninfo <tag>\` - 查询 Clash Royale 部落信息。

## 参数说明
* \`tag\` - 玩家或部落的标签，以 # 开头，例如 #CJ2L9PGLG。

## 示例
* \`/royale.playerinfo #CJ2L9PGLG\` - 查询标签为 #CJ2L9PGLG 的玩家信息。
* \`/royale.claninfo #2LUGUPJ\` - 查询标签为 #2LUGUPJ 的部落信息。

## 配置说明
* 请在插件设置页面配置API密钥
* 获取API密钥方法：
  1. 访问 Clash Royale 开发者门户网站 https://developer.clashroyale.com
  2. 注册或登录您的账号
  3. 在 My Account → Keys 页面创建一个新的API密钥
  4. 设置IP地址白名单（必填项，可填写您服务器的IP地址）
  5. 复制生成的API密钥到插件配置中
  
## 故障排除
如果查询失败，请检查：
1. 玩家或部落标签是否正确（区分大小写）
2. API密钥是否已正确配置
3. 服务器IP地址是否已添加到密钥的白名单中
4. API密钥是否已过期或超出使用限制
`;
