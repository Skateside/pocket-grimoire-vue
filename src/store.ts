import { defineStore } from "pinia"

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
