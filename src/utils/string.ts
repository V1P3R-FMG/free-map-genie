export function kebabCase(name: string) {
    return name.replace(/([a-z])([A-Z])/, (_, a, b) => `${a}-${b.toLowerCase()}`);
}
