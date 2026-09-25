import { CustomSetting } from "../customSetting";

import { Key } from "@/common/storage";
import backendService from "@/services/backend.service";

/**
 * Remembers which categories are shown or hidden in the left sidebar, per game
 * and user. The state is kept in the Dexie backend, next to the rest of the
 * user's data, so it survives reloads and stays with the profile.
 *
 * Map Genie used to persist this itself (it wrote localStorage keys like
 * `mg:settings:game_X:visible_categories:id_Y`, which the v2 extension picked up
 * with a storage filter). The current Map Genie dropped that: toggling a
 * category is now purely client-side, it sends no request and writes nothing, so
 * the state is lost on every reload. This brings the behaviour back.
 *
 * A toggle has no network or storage side effect to hook, and the sidebar
 * button only carries a `category-visible` / `category-hidden` class, so:
 *   - to save, we listen for clicks on the sidebar (delegated on the document,
 *     because map.js re-renders the list and a listener bound to it would stop
 *     working) and read the classes back a moment later, and
 *   - to restore, we click the buttons whose state differs from what we saved.
 *
 * It is always on. There is nothing to opt into, it just restores something Map
 * Genie used to do on its own.
 */
export class RememberCategoryFiltersSetting extends CustomSetting {
  public readonly label = "Remember Category Filters";

  private readonly backend = backendService.use();

  private saveTimer?: ReturnType<typeof setTimeout>;
  private applyTimer?: ReturnType<typeof setInterval>;

  // Stays true while we apply the saved state on load, so those programmatic
  // clicks don't get saved back as if the user made them.
  private applying = true;

  public get enabled(): boolean {
    return true;
  }

  public get applicable(): boolean {
    return !!window.user && this.categoryButtons().length > 0;
  }

  private categoryButtons(): HTMLButtonElement[] {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>("#categories .category-item")
    );
  }

  private categoryId(button: HTMLElement): number | null {
    const match = button.id.match(/category-item-(\d+)/);
    return match ? Number(match[1]) : null;
  }

  /**
   * Whether a category is shown. Returns null while the button has neither class
   * yet (it is still rendering), so we don't act on an unsettled state.
   */
  private isVisible(button: HTMLElement): boolean | null {
    if (button.classList.contains("category-visible")) return true;
    if (button.classList.contains("category-hidden")) return false;
    return null;
  }

  /** Read the current shown/hidden state of every settled category. */
  private readState(): Record<number, boolean> {
    const state: Record<number, boolean> = {};
    for (const button of this.categoryButtons()) {
      const id = this.categoryId(button);
      const visible = this.isVisible(button);
      if (id !== null && visible !== null) state[id] = visible;
    }
    return state;
  }

  /** Click the categories whose state differs from `saved`. Idempotent. */
  private applySaved(saved: Record<number, boolean>): number {
    let clicks = 0;
    for (const button of this.categoryButtons()) {
      const id = this.categoryId(button);
      if (id === null) continue;

      const wanted = saved[id];
      const current = this.isVisible(button);
      if (wanted === undefined || current === null) continue;

      if (current !== wanted) {
        button.click();
        clicks++;
      }
    }
    return clicks;
  }

  /** Stop applying the saved state. Called once the user takes over. */
  private stopApplying(): void {
    if (this.applyTimer) {
      clearInterval(this.applyTimer);
      this.applyTimer = undefined;
    }
    this.applying = false;
  }

  private save(): void {
    if (this.applying || !window.user) return;
    clearTimeout(this.saveTimer);
    // Coalesce the burst of clicks a group toggle produces.
    this.saveTimer = setTimeout(() => {
      this.backend
        .setCategoryFilters(Key.fromWindow(), this.readState())
        .catch((error) => logger.warn("Failed to save category filters", error));
    }, 300);
  }

  /** Wait until map.js has rendered the category sidebar. */
  private async waitForCategories(): Promise<void> {
    const start = Date.now();
    while (this.categoryButtons().length === 0 && Date.now() - start < 30000) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  public async init(): Promise<void> {
    // Poll the DOM for the sidebar instead of the base waitForMapLoaded() helper.
    // That helper waits for the map's "load" event, which never fires if the map
    // already loaded by the time we listen, and would hang init forever. We only
    // need the category buttons here anyway.
    await this.waitForCategories();

    // Settings are constructed before FMG fills in window.user, but by the time
    // the categories have rendered it is set (or the user is anonymous).
    if (!window.user) return; // nothing to remember for anonymous users

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest?.("#categories button")) {
          // The user is now in control, so stop re-applying the saved state and
          // save what they do instead. Let map.js flip the class before we read.
          this.stopApplying();
          setTimeout(() => this.save(), 250);
        }
      },
      true
    );
  }

  public async load(): Promise<void> {
    if (!window.user) {
      this.applying = false;
      return;
    }

    const saved = await this.backend
      .getCategoryFilters(Key.fromWindow())
      .catch(() => null);

    if (!saved || Object.keys(saved).length === 0) {
      this.applying = false;
      return;
    }

    // Categories render in batches and map.js re-renders the list, so a single
    // pass can miss buttons that aren't there yet (this matters most for
    // categories hidden by default, which we need to click open). Re-apply (it
    // is idempotent) until the sidebar both stops growing and needs no more
    // changes, then start saving the user's own toggles. stopApplying() also
    // runs as soon as the user clicks something, so we never fight them.
    const start = Date.now();
    let lastCount = -1;
    let stable = 0;
    this.applyTimer = setInterval(() => {
      const count = this.categoryButtons().length;
      const clicks = this.applySaved(saved);

      if (count === lastCount && clicks === 0) stable++;
      else stable = 0;
      lastCount = count;

      if (stable >= 3 || Date.now() - start > 20000) {
        this.stopApplying();
      }
    }, 400);
    this.applySaved(saved);
  }

  protected enable(): void {
    this.applying = false;
    this.save();
  }

  protected disable(): void {
    if (window.user) {
      this.backend.setCategoryFilters(Key.fromWindow(), {}).catch(() => {});
    }
  }
}
