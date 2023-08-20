import { createApp } from "vue";
import App from "./layout/app.vue";
import { send, reload, isConnectionError } from "../shared/send";

send("hello")
    .catch((err) => {
        if (isConnectionError(err as Error)) {
            reload();
            return Promise.resolve();
        }
        return Promise.reject(err);
    })
    .then(() => logger.log("extension script loaded"))
    .catch((err) => logger.error(err));

createApp(App).mount("#app");
