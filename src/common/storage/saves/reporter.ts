import z from "zod";

export type Errors = {
  [filename: string]: any[];
};

export class Reporter {
  private errors: Errors = {};

  public error(filename: string, message: any): void {
    this.errors[filename] ??= [];
    this.errors[filename].push(this.serializeError(message));
  }

  public collect(): Errors {
    const errors = this.errors;
    this.errors = {};
    return errors;
  }

  public serializeError(error: any): any {
    if (error instanceof z.ZodError) {
      return {
        type: "ZodError",
        tree: z.treeifyError(error),
      };
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
