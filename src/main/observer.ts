export type Options = { startsWith?: string, src?: string, match?: string };

export function getScript({ startsWith, src, match }: Options): Promise<HTMLScriptElement|null> {
    return new Promise((resolve, reject) => {

        function clear() {
            document.removeEventListener("DOMContentLoaded", loaded);
            observer.disconnect();
        }

        function loaded() {
            resolve(null);
            clear();
        }

        const observer = new MutationObserver(function (mutations_list) {
            mutations_list.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    const script = node.nodeName === "SCRIPT" ? node as HTMLScriptElement : null;
                    if (script) {
                        const isCorretScript = 0
                            || startsWith && script.innerText.startsWith(startsWith)
                            || src && script.src.match(src)
                            || match && script.innerText.match(match);

                        if (isCorretScript) {
                            resolve(script);
                            clear();
                        }
                    }
                });
            });
        });
        
        document.addEventListener("DOMContentLoaded", loaded);

        observer.observe(document, { childList: true, subtree: true });
    });
}