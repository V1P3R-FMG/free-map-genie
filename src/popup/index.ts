import { createApp } from "vue";
import App from "./app.vue";

// send("hello")
//     .catch(async (err) => {
//         if (isConnectionError(err as Error)) {
//             const data = await getData();
//             if (data.settings.extension_enabled) {
//                 reload();
//             }
//             return Promise.resolve();
//         }
//         return Promise.reject(err);
//     })
//     .then(() => logger.log("extension script loaded"))
//     .catch((err) => logger.error(err));

export const app = createApp(App).mount("#app");
