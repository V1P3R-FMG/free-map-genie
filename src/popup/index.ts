import { createApp } from "vue";
import App from "./layout/app.vue";
import channel from "@shared/channel/popup";

channel.connect();
createApp(App).mount("#app");
