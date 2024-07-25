import { waitForPageType } from "@fmg/page";
import mainLogin from "./login/login";
import mainMap from "./map/index";

export default async function initPage() {
    const pageType = await waitForPageType();
    logger.log("PageType:", pageType);

    switch (pageType) {
        case "login":
            await mainLogin();
            break;
        case "map":
            await mainMap();
            break;
    }
}
