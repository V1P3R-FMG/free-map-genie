declare global {
  export namespace NodeJS {
    interface ProcessEnv {
      /** Email for MG login [e2e] */
      MG_EMAIL?: string;
      /** Password for MG login [e2e] */
      MG_PASSWORD?: string;
    }
  }
}

declare module "dotenv" {
  export interface DotenvParseOutput extends NodeJS.ProcessEnv {
    MG_EMAIL?: string;
    MG_PASSWORD?: string;
  }
}

export {};
