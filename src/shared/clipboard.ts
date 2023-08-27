function clipboardLegacy(text: string) {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
}

async function clipboardModern(text: string) {
    return navigator.clipboard.writeText(text);
}

export default async function clipboard(text: string) {
    if (navigator.clipboard) {
        return clipboardModern(text);
    } else {
        return clipboardLegacy(text);
    }
}
