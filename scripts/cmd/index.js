const yargs = require("yargs/yargs");
const path = require("path");
const fs = require("fs");

const commands = {};
fs.readdirSync(__dirname).forEach(file => {
    if (file !== "index.js") {
        const filepath = path.join(__dirname, file);
        commands[path.parse(filepath).name] = require(filepath);
    }
})

yargs(process.argv.slice(2))
    .commandDir(path.join(__dirname))
    .demandCommand()
    .help()
    .parse();