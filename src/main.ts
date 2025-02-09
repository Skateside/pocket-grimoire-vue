import { createApp } from "vue"
import { createPinia } from "pinia"
import Game from "./Game.vue"

const pinia = createPinia();
const game = createApp(Game);

game.use(pinia);
game.mount("#game");

// createApp(Game).mount("#game")
