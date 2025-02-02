export default function exportData(
    _shared: any,
    json: string,
    _sendResponse: (response: any) => void
) {
    window.postMessage({ type: "fmg::import-data", json });
    return false;
}