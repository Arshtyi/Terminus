import { Context } from "@koishijs/client";
import MatchPage from "./match.vue";

export default (ctx: Context) => {
    // 注册组件，可以在插件配置页面中使用
    ctx.slot({
        type: "plugin-details",
        component: MatchPage,
        order: 0,
    });
};
