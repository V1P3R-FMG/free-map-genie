export const compareVersions = (a: string, b: string): number => {
  const [aParts, bParts] = [a, b].map((v) =>
    v.split(".").map((p) => parseInt(p.match(/\d+/)?.[0] || "0"))
  );
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  return 0;
};
