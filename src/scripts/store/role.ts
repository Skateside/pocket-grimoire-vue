import type {
    IRole,
} from "../types/data";
import type {
    IStorage,
} from "../classes/Storage";
import {
    defineStore,
} from "pinia"
import {
    computed,
    inject,
    ref,
} from "vue";

const useRoleStore = defineStore("role", () => {

    const storage = inject<IStorage>("storage")!;

    // TODO: Add functionality for augments.

    const STORAGE_KEY = "roles";
    const roles = ref<IRole[]>([
        ...window.PG.roles,
        ...storage.get<IRole[]>(STORAGE_KEY, []),
    ]);

    const getById = computed(() => (id: IRole["id"]) => {
        return roles.value.find(({ id: roleId }) => roleId === id);
    });

    const getIsMeta = computed(() => (id: IRole["id"]) => {
        return id === "_meta";
    });

    const getIsUniversal = computed(() => (id: IRole["id"]) => {
        return id === "universalinfo";
    });

    const getImage = computed(() => (id: IRole["id"], index: 0 | 1 | 2 = 0) => {

        const role = getById.value(id);

        if (!role || !role.image) {
            return "";
        }

        if (Array.isArray(role.image)) {
            return role.image[index];
        }
    
        return role.image;

    });

    const getReminders = computed(() => (id: IRole["id"]) => {

        const role = getById.value(id);
        const reminders: {
            local: NonNullable<IRole["reminders"]>,
            global: NonNullable<IRole["remindersGlobal"]>,
        } = {
            local: [],
            global: [],
        };

        if (!role) {
            return reminders;
        }

        if (role.reminders) {
            reminders.local.push(...role.reminders);
        }

        if (role.remindersGlobal) {
            reminders.global.push(...role.remindersGlobal);
        }

        return reminders;

    });

    return {
        // State.
        roles,
        // Getters.
        getById,
        getIsMeta,
        getIsUniversal,
        getImage,
        getReminders,
    };

});

export default useRoleStore;
