import { onMessage } from "webext-bridge/background";

onMessage<{ path: string }>("fmg:api:fetch", async (message) => {
    const {
        data: { path }
    } = message;

    const secret = /* @mangle */ __GLOBAL_API_SECRET__; /* @/mangle */

    const urlWithoutStartingSlash = path.replace(/^\//, "");
    const targetUrl = [`https://mapgenie.io/api/v1`, urlWithoutStartingSlash].join("/");

    const res = await fetch(targetUrl, {
        headers: {
            "X-Api-Secret": secret
        }
    });

    return res.json();
});