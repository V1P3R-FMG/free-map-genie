export class Settings {
    public remember_categories: boolean;

    public constructor(settings: Partial<FMG.Storage.V6.Settings>) {
        this.remember_categories = settings.remember_categories || false;
    }
}
