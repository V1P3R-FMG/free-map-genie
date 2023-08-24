export default function forward(name: string) {
    return function () {
        window.postMessage({ type: "fmg::" + name });
        return false;
    };
}
