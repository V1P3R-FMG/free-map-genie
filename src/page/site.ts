import { waitForDocumentBody } from "../shared/load_utils";

function hasClasses(classList: DOMTokenList, ...classes: string[]) {
	for (const classString of classes) {
		if (!classList.contains(classString)) return false;
	}
	return true;
}

export async function isList() {
    return window.location.origin === "https://mapgenie.io"
		&& window.location.pathname === "/";
}

// its still possible for other sites to be miss interpreted as a map, but for now this is my solution without hardcoding all map sites urls
export async function isMap() {
	return waitForDocumentBody()
		.then(body => hasClasses(body.classList, "map", "pogo"));
}

// its still possible for other sites to be miss interpreted as a guide, but for now this is my solution without hardcoding all guide sites urls
export async function isGuide() {
	return waitForDocumentBody()
		.then(body => hasClasses(body.classList, "guide", "pogo"));
}

export default async function type() {
    if (await isMap()) return "map";
    if (await isGuide()) return "guide";
    if (await isList()) return "list";
    return "none";
}