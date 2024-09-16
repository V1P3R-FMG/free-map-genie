export interface KeyData {
    map: number;
    game: number;
    user: number;
}

export default class Key {
    private constructor(
        public readonly map: number,
        public readonly game: number,
        public readonly user: number
    ) {}

    public static get current() {
        return this.fromWindow(window);
    }

    public static new(map: number, game: number, user: number): Key {
        return new this(map, game, user);
    }

    public static fromKeyData({ map, game, user }: KeyData): Key {
        return new this(map, game, user);
    }

    public static fromWindow(window: Window): Key {
        if (!window.mapData) throw "window.mapData is not defined.";
        if (!window.game) throw "window.game is not defined.";
        if (!window.user) throw "window.user is not defined.";

        return new this(window.mapData.map.id, window.game.id, window.user.id);
    }

    public toString(): string {
        return `${this.user}:${this.game}:${this.map}`;
    }
}
