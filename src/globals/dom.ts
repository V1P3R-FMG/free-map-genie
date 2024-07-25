declare global {
    interface Document {
        waitForDocumentBody(timeout?: number): Promise<HTMLElement>;
        waitForDocumentHead(timeout?: number): Promise<HTMLElement>;
    }
}

if (global.document) {
    Document.prototype.waitForDocumentBody = async function (
        timeout?: number
    ): Promise<HTMLElement> {
        return this.body
            ? this.body
            : Promise.waitFor<HTMLElement>(
                  (resolve) => this.body && resolve(this.body),
                  0,
                  timeout,
                  "Wait for body took to long."
              );
    };

    Document.prototype.waitForDocumentHead = async function (
        timeout?: number
    ): Promise<HTMLElement> {
        return this.head
            ? this.head
            : Promise.waitFor<HTMLElement>(
                  (resolve) => this.head && resolve(this.head),
                  undefined,
                  0,
                  "Wait for head took to long."
              );
    };
}

export {};
