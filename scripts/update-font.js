/**
 * Get the latest fontello zip file and extract the font and css files to the popup folder.
 */

import fs from "fs";
import path from "path";
import decompress from "decompress";

import dotenv from "dotenv";
const env = dotenv.parse(fs.readFileSync(".env"));

if (!env.FONTS_PATH) {
    throw new Error("FONTS_PATH not defined");
}

const fontsPath = env.FONTS_PATH;

function getLatestFont() {
    const files = fs.readdirSync(fontsPath);
    const fonts = [];
    for (const file of files) {
        if (path.extname(file) === ".zip" && file.startsWith("fontello")) {
            fonts.push({
                path: path.join(fontsPath, file),
                name: file,
                created: fs.statSync(path.join(fontsPath, file)).birthtimeMs
            });
        }
    }
    return fonts.sort((a, b) => a.created - b.created).pop();
}

async function updateFont() {
    const latestFont = getLatestFont();
    if (!latestFont) {
        throw new Error("No font found");
    } else {
        // eslint-disable-next-line no-undef
        console.log("Updating font: " + latestFont.name);
    }

    const inPath = latestFont.path;
    const outPath = path.join(
        path.dirname(inPath),
        path.basename(inPath, ".zip")
    );

    if (!fs.existsSync(path.join("src", "font"))) {
        fs.mkdirSync(path.join("src", "font"));
    }

    if (!fs.existsSync(path.join("src", "css"))) {
        fs.mkdirSync(path.join("src", "css"));
    }

    const files = await decompress(latestFont.path, outPath);
    for (const file of files) {
        const folder = path.basename(path.dirname(file.path));
        if (folder === "font") {
            fs.writeFileSync(
                path.join("src", "font", path.basename(file.path)),
                file.data,
                { flag: "w" }
            );
        } else if (folder === "css") {
            if (
                !file.path.includes("ie7") &&
                !file.path.includes("embedded") &&
                !file.path.includes("codes")
            ) {
                fs.writeFileSync(
                    path.join("src", "css", path.basename(file.path)),
                    file.data,
                    { flag: "w" }
                );
            }
        }
    }
    // eslint-disable-next-line no-undef
    console.log("Font updated");
}

updateFont();
