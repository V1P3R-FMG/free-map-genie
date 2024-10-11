export function full(version: string): string {
    const parts = version.split(".").slice(0, 4);
    while (parts.length < 3) {
        parts.push("0");
    }
    return parts.join(".");
}

export function compare(versionA: string, versionB: string): number {
    const versionAParts = versionA.split(".");
    const versionBParts = versionB.split(".");

    const maxLength = Math.max(versionAParts.length, versionBParts.length);

    for (let i = 0; i < maxLength; i++) {
        const aPart = versionAParts[i] || "0";
        const bPart = versionBParts[i] || "0";
        if (aPart > bPart) return 1;
        if (aPart < bPart) return -1;
    }

    return 0;
}
