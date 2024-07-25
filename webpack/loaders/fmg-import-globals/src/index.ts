export default function globals(source: string) {
    return [
        "import '@globals'",
        "const console = undefined", // Remove logger from all modules to prefer logger over console.
        source,
    ].join(";");
}
