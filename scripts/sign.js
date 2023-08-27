import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const env = dotenv.config();
if (env.error) throw env.error;

const packageJson = JSON.parse(
    fs.readFileSync("./package.json", { encoding: "utf-8" }).toString()
);

const version = packageJson.version;
const folder = path.resolve("dist", "fmg-firefox-v" + version);
const artifacts = path.resolve(folder, "web-ext-artifacts");
const output = folder + ".xpi";

if (fs.existsSync(artifacts)) {
    fs.rmSync(artifacts, { recursive: true });
}

execSync("npx web-ext sign", {
    cwd: folder,
    env: env.parsed,
    stdio: "inherit"
});

const extension = fs.readdirSync(artifacts)[0];
if (!extension) throw new Error("No extension found in artifacts folder!");

if (fs.existsSync(output)) {
    fs.rmSync(output);
}

fs.renameSync(path.resolve(artifacts, extension), output);

// eslint-disable-next-line no-undef
console.log(`Extension v${version} signed successfully!`);
