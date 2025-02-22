import type {
    IInfoToken,
    IRole,
} from "./scripts/types/data";
import { defineStore } from "pinia"
import { computed, ref, watch } from "vue";

export const useGlobalStore = defineStore("global", {

    state: () => ({ ...window.PG }),

    getters: {

        getRole: (state) => {
            return (roleId: string) => {
                return state.roles.find(({ id }) => id === roleId);
            };
        },

    },

});

// Idea for the Info Tokens

const storage = {

    key: "pg",

    getStored() {
        return JSON.parse(localStorage.getItem(this.key) || "{}");
    },

    get<T = any>(key: string, defaultValue?: T) {
        return (this.getStored()[key] ?? defaultValue) as T;
    },

    set(key: string, value: any) {

        const stored = this.getStored();

        stored[key] = value;
        localStorage.setItem(this.key, JSON.stringify(stored));

        return true;

    }

};

export const useRoleStore = defineStore("role", () => {

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

export const useInfoTokenStore = defineStore("info-token", () => {

    const STORAGE_KEY = "info-tokens";
    const infoTokens = ref<IInfoToken[]>([
        ...window.PG.infoTokens,
        ...storage.get<IInfoToken[]>(STORAGE_KEY, []),
    ]);

    watch(infoTokens, (value) => {
        storage.set(STORAGE_KEY, value.filter(({ isCustom }) => isCustom));
    });

    const getById = computed(() => (id: IInfoToken["id"]) => {
        return infoTokens.value.find(({ id: infoTokenId }) => infoTokenId === id);
    });

    const byType = computed(() => {
        return Object.groupBy(infoTokens.value, ({ isCustom }) => (
            isCustom
            ? "custom"
            : "official"
        ));
    });

    const add = (text: IInfoToken["text"]) => {

        // TODO: randomId()
        const infoToken: IInfoToken = {
            id: `cit-${Math.random().toString(32).slice(2)}`,
            text,
            colour: "grey",
            isCustom: true,
        };

        infoTokens.value.push(infoToken);

    };

    const getIndexOrDie = (id: IInfoToken["id"]) => {

        const index = infoTokens.value.findIndex(({ id: infoTokenId }) => {
            return infoTokenId === id;
        });

        if (index < 0) {
            // console.warn("Unable to find Info Token with id '%s'", id);
            // return;
            throw new Error(id);
        }

        return index;

    }

    const getCustomIndex = (id: IInfoToken["id"]) => {

        const index = getIndexOrDie(id);
        const infoToken = infoTokens.value[index];

        if (!infoToken.isCustom) {
            // console.warn("Info Token '%s' is not custom and cannot be updated", id);
            // return;
            throw new Error(id);
        }

        return index;

    };

    const update = (id: IInfoToken["id"], text: IInfoToken["text"]) => {

        const index = getCustomIndex(id);

        infoTokens.value[index] = {
            ...infoTokens.value[index],
            text,
        };

    };

    const remove = (id: IInfoToken["id"]) => {

        const index = getCustomIndex(id);

        infoTokens.value.splice(index, 1);

    };

    return {
        // State.
        infoTokens,
        // Getters.
        getById,
        byType,
        // Actions.
        add,
        update,
        remove,
    };

});
