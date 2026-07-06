import { CustomSetting, type StorageEntry } from "../customSetting";

export class RememberTagFiltersSetting extends CustomSetting {
  public readonly label = "Remember Tag Filters";

  private setting!: StorageEntry<boolean>;
  private tagSettings!: Map<number, StorageEntry<boolean>>;
  private tagLinks: JQuery<HTMLDivElement> = $();

  private loading = false;

  public get enabled() {
    return this.setting.value !== null;
  }

  public get applicable(): boolean {
    return this.tagLinks.length > 0;
  }

  private interceptSelectedTagFilterChanges() {
    this.store.subscribe(() => {
      if (!this.loaded) return;
      if (this.loading) return;

      if (this.enabled) {
        this.save();
      }
    });
  }

  private save() {
    this.tagLinks.each((_, element) => {
      const tagId = $(element).data("tag-id");
      if (tagId) {
        const setting = this.tagSettings.get(Number(tagId));
        if (setting) {
          const isSelected = $(element).hasClass("selected");
          setting.value = isSelected ? true : null;
        }
      }
    });
  }

  private clickTagFilter(tagId: number) {
    const tagLink = this.tagLinks.filter(`[data-tag-id="${tagId}"]`).get(0);

    if (tagLink) {
      const e = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        shiftKey: true,
      });

      tagLink.dispatchEvent(e);

      logger.debug(`Clicked tag filter with ID ${tagId}.`);
    } else {
      logger.warn(`Tag link with ID ${tagId} not found`);
    }
  }

  public async load() {
    const storedValue = this.setting.value;
    if (storedValue !== null) {
      this.loading = true;

      this.tagSettings.forEach((setting, tagId) => {
        const tagFilterValue = setting.value;
        if (tagFilterValue) {
          this.clickTagFilter(tagId);
        }
      });

      this.loading = false;
    }
  }

  public async init() {
    const gameId = await this.waitForGameId();

    this.setting = this.StorageEntry.get<boolean>(
      ["game", gameId],
      "remember_tag_filters"
    );

    await this.waitForStore();
    await this.waitForMapLoaded();

    // Load individual tag filter settings
    this.tagSettings = new Map();

    this.tagLinks = $(".tags-panel .tag-link");
    this.tagLinks.each((_, element) => {
      const tagId = $(element).data("tag-id");
      if (tagId) {
        const setting = this.StorageEntry.get<boolean>(
          ["game", gameId],
          ["tag_filter", tagId]
        );
        this.tagSettings.set(Number(tagId), setting);
      }
    });

    this.interceptSelectedTagFilterChanges();
  }

  protected enable(): void {
    this.setting.value = true;

    this.save();
  }

  protected disable(): void {
    this.setting.value = null;

    this.tagSettings.forEach((setting) => {
      setting.value = null;
    });
  }
}
