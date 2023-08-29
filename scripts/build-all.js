import { exec, execSync } from "child_process";

function build(browser) {
    return new Promise((resolve, reject) => {
        const process = exec("yarn build-" + browser);

        process.stdout.on("data", (data) => {
            // eslint-disable-next-line no-undef
            console.log(`[${browser}]`, data);
        });

        process.stderr.on("data", (data) => {
            // eslint-disable-next-line no-undef
            console.error(`[${browser}]`, data);
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject();
            }
        });
    });
}

Promise.all([build("chrome"), build("firefox")]).then(() => {
    execSync("yarn sign", { stdio: "inherit" });
});
