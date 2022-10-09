import siteType, { isMap, isGuide, isList } from "../page/site";

type Request = { action: string };
type SendResponse = (e?: object) => void;

function error(message: string) {
    window.postMessage({ type: "mg:error", message }, "*");
}

function get_status(sendResponse: SendResponse) {
    Promise.resolve()
		.then(async () => {
			sendResponse({
				is_list:    await isList(),
				is_map:     await isMap(),
				is_guide:   await isGuide(),
			});
		});
    return true;
}

function reload_window(sendResponse: SendResponse) {
    Promise.resolve()
		.then(async () => {
			switch (await siteType()) {
				case "none":
					break
				default:
					window.location.reload();
					break
			}
			sendResponse();
		})
    return true;
}

function export_mapdata(sendResponse: SendResponse) {
    window.postMessage({ type: "fmg:map:export" });
    return false;
}

function import_mapdata(sendResponse: SendResponse) {
    window.postMessage({ type: "fmg:map:import" });
    return false;
}

function clear_mapdata(sendResponse: SendResponse) {
    window.postMessage({ type: "fmg:map:clear" });
    return false;
}


export const handlers: Dict<string, CallableFunction> = {
    get_status,
    reload_window,
    export_mapdata,
    import_mapdata,
    clear_mapdata
}

export function handleRequest(request: Request, _: any, sendResponse: SendResponse) {
    const action = handlers[request.action];

    if (action) return action(sendResponse);

    console.warn("Extension can't handle request ", request);
    return false;
}