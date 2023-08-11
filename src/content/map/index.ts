export const FmgMapInstalled = Symbol("FmgMapInstalled");

export type FmgMapWindow = Window & { [FmgMapInstalled]?: FMG_Map };

/**
 * The fmg map script
 * Handles all map related functionality
 */
export class FMG_Map {
    private window: Window;

    protected constructor(window: Window) {
        this.window = window;

        this.setProFeaturesEnabled();
    }

    /**
     * Install the map
     * @param window the window to install the map on
     * @returns the installed map
     */
    public static install(window: FmgMapWindow) {
        if (!window[FmgMapInstalled]) {
            window[FmgMapInstalled] = new FMG_Map(window);
        }
        return window[FmgMapInstalled];
    }

    /**
     * Enable pro features
     */
    private setProFeaturesEnabled() {
        if (this.window.user) this.window.user.hasPro = true;
        if (this.window.config) this.window.config.presetsEnabled = true;
    }
}
