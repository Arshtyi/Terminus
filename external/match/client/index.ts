import { Context } from "@koishijs/client";
import MatchPage from "./match.vue";

export default (ctx: Context) => {
    ctx.slot({
        type: "plugin-details",
        component: MatchPage,
        order: 0,
    });
};
