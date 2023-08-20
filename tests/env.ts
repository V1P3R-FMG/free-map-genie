import * as fs from "fs";
import { JSDOM } from "jsdom";
import { AxiosMethods, type AxiosMethod } from "@fmg/filters/api-filter";

const window = global as any;

const _tarkov = JSON.parse(fs.readFileSync("./tests/data/tarkov.json", "utf8"));
const _storage = {
    v1: JSON.parse(fs.readFileSync("./tests/data/storage/v1.json", "utf8")),
    v2: JSON.parse(fs.readFileSync("./tests/data/storage/v2.json", "utf8"))
};

let muted = false;
window.logger = new Proxy(console, {
    get(_, prop) {
        if (prop === "mute") return () => (muted = true);
        if (prop === "unmute") return () => (muted = false);
        if (muted) return () => {};
        return console[prop as keyof typeof console];
    }
});

window.createWindow = function () {
    const dom = new JSDOM("", {
        url: "https://mapgenie.io/tarkov/maps/factory"
    });

    globalThis.window = dom.window as any;

    globalThis.localStorage = dom.window.localStorage;
    globalThis.sessionStorage = dom.window.sessionStorage;

    dom.window.logger = console as any;

    dom.window.game = _tarkov.game;
    dom.window.user = _tarkov.user;

    dom.window.mapData = {
        maps: _tarkov.maps,
        map: _tarkov.maps.find((m: { slug: string }) => m.slug === "factory")
    };

    dom.window.axios = Object.fromEntries(
        AxiosMethods.map((method) => [
            method,
            jest.fn(() => Promise.resolve(method))
        ])
    ) as any;

    return dom.window;
};

function createStorageLoader(version: "v1" | "v2") {
    return function () {
        if (!window?.localStorage)
            throw new Error("window.localStorage not defined");
        for (const [key, value] of Object.entries(_storage[version])) {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    };
}

window.loadV1Storage = createStorageLoader("v1");
window.loadV2Storage = createStorageLoader("v2");

declare global {
    function createWindow(): Window;
    function loadV1Storage(): void;
    function loadV2Storage(): void;

    interface Window {
        logger: typeof console & {
            mute(): void;
            unmute(): void;
        };

        axios: {
            [key in AxiosMethod]: jest.Mock<Promise<any>>;
        };

        game: {
            id: number;
            slug: string;
        };

        mapData: {
            map: {
                id: number;
                slug: string;
            };
            maps: {
                id: number;
                slug: string;
            }[];
        };

        user: {
            id: number;
        };
    }
}

export {};
