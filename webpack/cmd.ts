import { execSync } from "child_process";

export interface CallableCondition {
    (): boolean;
}

export type Condition = boolean | CallableCondition;

function evalCondition(condition: Condition) {
    switch (typeof condition) {
        case "function":
            return condition();
        case "boolean":
            return condition;
        default:
            throw "Invalid condition";
    }
}

export class CommandBuilder {
    private cmdArgs: string[] = [];
    private ifStack: string[][] = [];

    private constructor(private cmd: string) {}

    public static command(cmd: string) {
        return new CommandBuilder(cmd);
    }

    public args(...args: string[]) {
        if (this.ifStack.length) {
            this.ifStack.at(-1).push(...args);
        } else {
            this.cmdArgs.push(...args);
        }
        return this;
    }

    public arg(arg: string) {
        this.args(arg);
        return this;
    }

    public argString(arg: string) {
        this.args(`"${arg}"`);
        return this;
    }

    public startIf() {
        this.ifStack.push([]);
        return this;
    }

    public endIf(condition: Condition) {
        const args = this.ifStack.pop();
        if (!args) throw "If stack is empty";

        if (evalCondition(condition)) {
            this.args(...args);
        }

        return this;
    }

    public build() {
        return [this.cmd, ...this.cmdArgs].join(" ");
    }

    public execSync() {
        // console.log("cmd", this.build());
        return execSync(this.build());
    }

    public execSyncUtf8() {
        // console.log("cmd", this.build());
        return execSync(this.build()).toString("utf-8");
    }
}
