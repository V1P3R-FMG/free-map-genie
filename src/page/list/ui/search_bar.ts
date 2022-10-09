import Fuse from "fuse.js";
import FMG_ListManager from "../list_manager";

const SCORE_EPSILON = 0.5;

class GameCard {

    public readonly $element: JQuery<HTMLElement>;

    public readonly title: string;

    constructor(card: HTMLElement) {
        this.$element = $(card);

        this.title = this.$element.find(".card-body > h4").text()
    }
}

export default class FMG_SearchBar {

    private readonly _gameCards: Array<GameCard>;
    private readonly _fuse: Fuse<GameCard>;
    private readonly $gameCards: JQuery<HTMLElement>;
    private readonly $input: JQuery<HTMLElement>;

    constructor(manager: FMG_ListManager) {

        this.$gameCards = $(manager.document).find("#games-list-container").find(".games").children();

        this._gameCards = [];

        this.$gameCards.each((_, card) => {
            const gameCard = new GameCard(card);

            this._gameCards.push(gameCard);
        });

        this._fuse = new Fuse(this._gameCards, {
            keys: ["title"],
            minMatchCharLength: 1,
            includeScore: false,
            shouldSort: false,
            includeMatches: false,
            threshold: 0,
            ignoreLocation: true,
        });

        this.$input = $(`<input id="game-search-input" list="games-list" type="search" placeholder="Search..." name="fmg:game_search">`)
                                .insertBefore($(manager.document).find("#game-search-input").hide());

        this.$input.on("keyup", () => this._filterGameList(this.$input.val() as string));
    }

    private _filterGameList(text: string) {

        const results = this._fuse.search(text);

        const ids = results.filter(result => {
            return (result.score || 0) <= SCORE_EPSILON;
        }).map(gameCard => gameCard.refIndex);

        this._gameCards.forEach((game, i) => {
            $(game.$element).toggle(text.length == 0 || ids.includes(i));
        });
    }
}