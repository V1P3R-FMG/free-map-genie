import { createApp } from "vue";
import App from "./layout/app.vue";
import { send, reload, isConnectionError } from "../shared/send";
import { getData } from "@shared/extension";

send("hello")
    .catch(async (err) => {
        if (isConnectionError(err as Error)) {
            const data = await getData();
            if (data.settings.extension_enabled) {
                reload();
            }
            return Promise.resolve();
        }
        return Promise.reject(err);
    })
    .then(() => logger.log("extension script loaded"))
    .catch((err) => logger.error(err));

createApp(App).mount("#app");
