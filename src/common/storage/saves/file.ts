export class SerializedFile {
  public constructor(
    public readonly filename: string,
    public readonly content: string
  ) {}

  public static async fromInputFile(file: File): Promise<SerializedFile> {
    const content = await file.text();
    return new SerializedFile(file.name, content);
  }
}
