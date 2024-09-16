import express from "express";
import path from "node:path";
import fs from "node:fs";
import "dotenv/config";

const cacheDir = path.resolve(".cache");

async function downloadFile(url: string, filepath: string, headers?: Record<string, string>) {
    const res = await fetch(url, { headers });
    const text = await res.text();

    await fs.promises.writeFile(filepath, text, { flag: "w", encoding: "utf-8" });
}

function sendJson(res: express.Response, filepath: string) {
    const text = fs.readFileSync(filepath, { encoding: "utf-8" });

    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.send(text);
}

export default async function startServer(port: number) {
    const app = express();

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    const API_SECRET = process.env.API_SECRET;
    if (!API_SECRET) {
        console.warn("No api secret");
    }

    app.get("/api/v1/games", async (_, res) => {
        const filepath = path.join(cacheDir, "games.json");

        if (!fs.existsSync(filepath)) {
            await downloadFile("https://mapgenie.io/api/v1/games", filepath);
        }

        sendJson(res, filepath);
    });

    app.get("/api/v1/games/:gameId/full", async (req, res) => {
        const { gameId } = req.params;

        const filepath = path.join(cacheDir, `game_${gameId}.json`);

        if (!API_SECRET) {
            res.setHeader("Content-Type", "application/json");
            res.status(200);
            res.send("{}");
        }

        if (!fs.existsSync(filepath)) {
            await downloadFile(`https://mapgenie.io/api/v1/games/${gameId}/full`, filepath, {
                "X-Api-Secret": process.env.API_SECRET,
            });
        }

        sendJson(res, filepath);
    });

    app.get("/api/v1/maps/:mapId/full", async (req, res) => {
        const { mapId } = req.params;

        const filepath = path.join(cacheDir, `map_${mapId}.json`);

        if (!fs.existsSync(filepath)) {
            await downloadFile(`https://mapgenie.io/api/v1/maps/${mapId}/full`, filepath, {
                "X-Api-Secret": process.env.API_SECRET,
            });
        }

        sendJson(res, filepath);
    });

    app.get("/api/v1/maps/:mapId/heatmaps", async (req, res) => {
        const { mapId } = req.params;

        const filepath = path.join(cacheDir, `heatmaps_${mapId}.json`);

        if (!fs.existsSync(filepath)) {
            await downloadFile(`https://mapgenie.io/api/v1/maps/${mapId}/heatmaps`, filepath, {
                "X-Api-Secret": process.env.API_SECRET,
            });
        }

        sendJson(res, filepath);
    });

    const server = app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);

        process.on("exit", () => {
            server.close();
        });
    });
}

if (process.argv[1] === import.meta.filename) {
    const port = process.argv[2] ? Number(process.argv[2]) : 8080;
    if (Number.isNaN(port)) throw "Invalid port given";

    startServer(port);
}
