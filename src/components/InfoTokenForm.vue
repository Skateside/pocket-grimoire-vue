<template>

    <form ref="form" @submit.prevent="handleSubmit">

        <input
            v-model="id"
            type="hidden"
            name="info-token-id"
        >

        <p>
            <label for="info-token-text">Text</label>
            <input
                v-model.trim="text"
                type="text"
                name="info-token-text"
                id="info-token-text"
                required
            >
        </p>
        <p>
            <button
                ref="submit"
                type="submit"
                data-create="Create"
                data-update="Update"
            >{{ submitText }}</button>
            <button type="reset">Cancel</button>
        </p>

    </form>

</template>

<script setup lang="ts">
import type { IInfoToken } from '../scripts/types/data';
import { computed, ref } from "vue";

const props = withDefaults(defineProps<{
    mode?: "create" | "update",
}>(), {
    mode: "create",
});
const form = ref<HTMLFormElement | null>();
const submit = ref<HTMLButtonElement | null>(null);
const submitText = computed(() => {
    return submit.value?.dataset[props.mode] || "";
});

const id = defineModel<IInfoToken["id"]>("id");
const text = defineModel<IInfoToken["text"]>("text");

const emit = defineEmits<{
    (e: "create", text: IInfoToken["text"]): void,
    (e: "update", id: IInfoToken["id"], text: IInfoToken["text"]): void,
}>();

const handleSubmit = () => {

    if (props.mode === "create" && text.value) {
        emit("create", text.value);
    } else if (props.mode === "update" && id.value && text.value) {
        emit("update", id.value, text.value);
    }

    form.value?.reset();

};
</script>
