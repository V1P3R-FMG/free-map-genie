import uid from "tiny-uid";

export default function exportData(
    _shared: any,
    _data: any,
    sendResponse: (response: any) => void
) {
    const id = uid(7, true);

    function listener(e: MessageEvent) {
        if (typeof e.data !== "object") return;

        switch (e.data.type) {
            case "fmg::export-data::response":
                if (e.data.id !== id) return;

                sendResponse(e.data.exportedData);

                window.removeEventListener("message", listener);
        }
    }

    window.addEventListener("message", listener);

    window.postMessage({ type: "fmg::export-data", id });

    return true;
}