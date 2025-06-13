<template>
    <k-card class="match-card">
        <h3>OI 比赛信息</h3>
        <p class="match-description">通过此插件获取最近的编程竞赛信息</p>

        <div class="match-platforms">
            <div class="match-platform">
                <h4>CodeForces</h4>
                <p>命令：{{ config.codeforces.command }}</p>
                <p>
                    状态：{{ config.codeforces.enabled ? "已启用" : "已禁用" }}
                </p>
                <p>获取数量：{{ config.codeforces.maxCount }}</p>
            </div>

            <div class="match-platform">
                <h4>AtCoder</h4>
                <p>命令：{{ config.atcoder.command }}</p>
                <p>状态：{{ config.atcoder.enabled ? "已启用" : "已禁用" }}</p>
                <p>获取数量：{{ config.atcoder.maxCount }}</p>
            </div>

            <div class="match-platform">
                <h4>牛客网</h4>
                <p>命令：{{ config.nowcoder.command }}</p>
                <p>状态：{{ config.nowcoder.enabled ? "已启用" : "已禁用" }}</p>
                <p>获取数量：{{ config.nowcoder.maxCount }}</p>
            </div>
        </div>

        <p class="match-help">您可以在上方的配置选项卡中修改以上设置</p>
    </k-card>
</template>

<script lang="ts" setup>
import { ref } from "vue";

// 默认配置
const config = ref({
    codeforces: {
        enabled: true,
        maxCount: 3,
        timeout: 10000,
        command: "cf",
    },
    atcoder: {
        enabled: true,
        maxCount: 2,
        timeout: 10000,
        command: "atc",
    },
    nowcoder: {
        enabled: true,
        maxCount: 3,
        timeout: 20000,
        command: "nc",
    },
});
</script>

<style lang="scss">
.match {
    &-card {
        margin-bottom: 1rem;
    }

    &-description {
        margin-bottom: 1.5rem;
        color: var(--fg2);
    }

    &-platforms {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    &-platform {
        padding: 1rem;
        border-radius: 8px;
        background-color: var(--card);
        border: 1px solid var(--border);

        h4 {
            margin-top: 0;
            margin-bottom: 0.5rem;
        }

        p {
            margin: 0.5rem 0;
            font-size: 0.9rem;
        }
    }

    &-help {
        color: var(--fg2);
        font-style: italic;
        margin-top: 1rem;
    }
}
</style>
