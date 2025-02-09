<template>

    <div>
        <button
            v-for="role in store.roles"
            :key="role.id"
            @click="() => roleId = role.id"
        >{{ role.name }}</button>
    </div>

    <RoleToken v-if="roleId" :id="roleId" />

</template>

<script lang="ts" setup>
    import { ref } from 'vue';
    import { useGlobalStore } from "../src/store";
    import RoleToken from './components/RoleToken.vue';

    const store = useGlobalStore();
    const roleId = ref('');
</script>

<style lang="scss" scoped>
div {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25em;
}
</style>
