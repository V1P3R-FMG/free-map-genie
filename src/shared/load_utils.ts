export async function waitForDomLoaded(): Promise<null> {
    return new Promise(resolve => {
        if (document.readyState === "complete") {
            resolve(null);
        } else {
            const handle = setInterval(() => {
                if (document.readyState === "complete") {
                    clearInterval(handle);
                    resolve(null);
                }
            }, 100);
        }
    });
}

export async function waitForDocumentBody(): Promise<HTMLBodyElement> {
	return new Promise(resolve => {
        if (document.body) {
            resolve(document.body as HTMLBodyElement);
        } else {
            const handle = setInterval(() => {
                if (document.body) {
                    clearInterval(handle);
                    resolve(document.body as HTMLBodyElement);
                }
            }, 100);
        }
    });
}

export async function waitForGlobalsLoaded(globalVarNames: string[], timeout: number=60*1000) {

    function globalsLoaded() {
        for (const globalVarName of globalVarNames) {
            if (typeof window[globalVarName as keyof Window] === "undefined") {
                return false;
            }
        }
        return true
    }

    return new Promise((resolve, reject) => {
        if (globalsLoaded()) {
            resolve(void 0);
        } else {
            const handle = setInterval(() => {
                if (globalsLoaded()) {
                    clearInterval(handle);
                    resolve(void 0);
                }
            }, 100);
        }
        setTimeout(() => reject("WaitForGlobals timeout reached!"), timeout);
    });
}