export class Key {
  constructor(public readonly gameId: number, public readonly userId: number) {}

  public static fromWindow() {
    if (window.user && window.game) {
      return new Key(window.game.id, window.user.id);
    }
    throw new Error("No user or game in window");
  }

  public static fromWindowGame(gameId: number) {
    if (window.user) {
      return new Key(gameId, window.user.id);
    }
    throw new Error("No user in window");
  }
}
