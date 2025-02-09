<template>

    <div class="list">
        <button
            v-for="role in globalStore.roles"
            :key="role.id"
            type="button"
            @click="() => roleId = role.id"
        >{{ role.name }}</button>
    </div>

    <RoleToken v-if="roleId" :id="roleId" />

    <hr>

    <div class="list">
        <button
            v-for="infoToken in infoTokenStore.infoTokens"
            :key="infoToken.id"
            type="button"
            @click="() => infoTokenId = infoToken.id"
        >{{ infoToken.text }}</button>
    </div>

</template>

<script lang="ts" setup>
    import { ref } from 'vue';
    import { useInfoTokenStore, useGlobalStore } from "../src/store";
    import RoleToken from './components/RoleToken.vue';

    const globalStore = useGlobalStore();
    const roleId = ref("");

    const infoTokenStore = useInfoTokenStore();
    const infoTokenId = ref("");
</script>

<style lang="scss" scoped>
.list {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25em;
}
</style>
