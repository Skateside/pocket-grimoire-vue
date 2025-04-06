<template>
    <div ref="grimoire" class="grimoire movable">

        <div
            v-for="token, index in tokens"
            class="seat movable__item"
            :data-index="index"
            :style='{
                "--x": token.x,
                "--y": token.y,
                "--z": token.z,
            }'
        >
            seat {{ index }}
        </div>

    </div>
    
    <p><button type="button" @click="addSeat">Add seat</button></p>
    {{ __debug }}

</template>

<script lang="ts" setup>
import {
    nextTick,
    onMounted,
    onUnmounted,
    ref,
} from "vue";
import {
    debounce,
    noop,
} from "../scripts/utilities/functons";
import {
    clamp,
} from "../scripts/utilities/numbers";

type ICoordinates = {
    x: number,
    y: number,
    z?: number,
};

type IToken = Required<ICoordinates> & {
    // seat vs. reminder
};

// type IPad = Required<ICoordinates> & {
//     w: number,
//     h: number,
// };
type IPad = {
    z: Required<ICoordinates>["z"],
};

const __debug = ref<Record<string, any>>({});
const grimoire = ref<HTMLElement | null>(null);
const tokens = ref<IToken[]>([]);
const isDragging = ref<boolean>(false);
const pad = ref<IPad>({
    // x: 0,
    // y: 0,
    z: 0,
    // w: 0,
    // h: 0,
});

const addSeat = () => {

    tokens.value.push({
        x: 0.1,
        y: 0.1,
        z: pad.value.z,
    });

    pad.value.z += 1;

};

const getToken = (target: Element) => {
    return (target as HTMLElement).closest<HTMLElement>(".movable__item[data-index]");
};

let dragHandler: (event: MouseEvent | TouchEvent) => void = noop;

const getIndex = (token: HTMLElement | null) => {

    return (
        token
        ? Number(token.dataset.index || "-1")
        : -1
    );

};

const moveTo = (token: HTMLElement, { x, y, z }: ICoordinates) => {

    if (typeof z !== "number" || Number.isNaN(z)) {
        z = pad.value.z;
    }

    const index = getIndex(token);

    if (index < 0) {
        return;
    }

    Object.assign(tokens.value[index], {
        x,
        y,
        z,
    });

};

const dragObject = (token: HTMLElement, event: MouseEvent | TouchEvent) => {

    if (!grimoire.value) {
        return;
    }

    event.preventDefault();

    const {
        x,
        y,
        width,
        height,
    } = grimoire.value.getBoundingClientRect();
    const {
        scrollX,
        scrollY,
    } = window;
    let left = 0;
    let top = 0;


    if (event instanceof MouseEvent) {

        const {
            clientX,
            clientY,
        } = event;

        left = (clientX + scrollX - x) / (width - x);
        top = (clientY + scrollY - y) / (height - y);

    } else if (event instanceof TouchEvent) {

        const {
            targetTouches,
        } = event;

        if (targetTouches.length) {

            left = (targetTouches[0].clientX + scrollX - x) / (width - x);
            top = (targetTouches[0].clientY + scrollY - y) / (height - y);

        }

    }

    moveTo(token, {
        x: clamp(0, left, 1),
        y: clamp(0, top, 1),
    });

};

const startDrag = (event: MouseEvent | TouchEvent) => {

    const token = getToken(event.target as HTMLElement);
    const index = getIndex(token);

    if (!token || index < 0) {
        return;
    }

    const {
        z,
    } = pad.value;
    
    endDragging();
    dragHandler = (event) => dragObject(token, event);

    tokens.value[index].z = z;
    pad.value.z += 1;

    window.addEventListener("mousemove", dragHandler);
    window.addEventListener("touchmove", dragHandler, {
        passive: false,
    });

};

const endDragging = () => {

    if (dragHandler === noop) {
        return;
    }

    window.removeEventListener("mousemove", dragHandler);
    window.removeEventListener("touchmove", dragHandler);
    dragHandler = noop;

    // The order of events is mousedown -> mouseup -> click. This means that we
    // need to delay the resetting of `isDragging` so that the handler attached
    // to the click event doesn't trigger after dragging. This only seems to be
    // an issue on desktop - mobile seems to be fine.
    nextTick(() => {
        isDragging.value = false;
    });

};

const checkClick = (event: MouseEvent) => {

    const element = getToken(event.target as HTMLElement);

    if (!element || isDragging.value) {
        return;
    }

    // emit.trigger("movable-click", element);

};

const updatePadDimentions = debounce(() => {

    if (!grimoire.value) {
        return;
    }

    const {
        left,
        top,
        width,
        height,
    } = grimoire.value.getBoundingClientRect();

    Object.assign(pad.value, {
        x: left,
        y: top,
        w: width,
        h: height,
    });

}, 150);

onMounted(() => {

    document.addEventListener("mousedown", startDrag);
    document.addEventListener("touchstart", startDrag);
    document.addEventListener("mouseup", endDragging);
    document.addEventListener("touchend", endDragging);
    document.addEventListener("contextmenu", endDragging);
    document.addEventListener("click", checkClick);
    window.addEventListener("resize", updatePadDimentions);
    window.addEventListener("scroll", updatePadDimentions);

    updatePadDimentions();

});

onUnmounted(() => {

    document.removeEventListener("mousedown", startDrag);
    document.removeEventListener("touchstart", startDrag);
    document.removeEventListener("mouseup", endDragging);
    document.removeEventListener("touchend", endDragging);
    document.removeEventListener("click", endDragging);
    document.removeEventListener("contextmenu", checkClick);
    window.removeEventListener("resize", updatePadDimentions);
    window.removeEventListener("scroll", updatePadDimentions);

});
</script>

<style lang="scss" scoped>
.grimoire {
    border: 2px solid #000;
    background-color: #222;
    height: 80vh;
}

.seat {
    width: 4em;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    background-color: #ddd;
    border: 2px solid #000;
    border-radius: 50%;
}

.movable {
    position: relative;
}

.movable__item {
    --x: 0;
    --y: 0;
    --z: 0;
    cursor: move;
    position: absolute;
    left: calc(var(--x) * 100%);
    top: calc(var(--y) * 100%);
    z-index: var(--z);
    touch-action: none;
    transform: translate(-50%, -50%);
}
</style>
