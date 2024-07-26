import initLogin from "./login";
import fixMapScript from "./script";

export default async function main() {
    await initLogin();
    fixMapScript();

    const store = await Promise.waitFor<MG.Store>((resolve) => window.store && resolve(window.store));
    logger.debug(store);
}
