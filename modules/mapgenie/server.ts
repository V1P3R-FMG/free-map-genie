import express from "express";
import axios from "axios";
import chalk from "chalk";
import http from "node:http";

import { setupCache } from "axios-cache-interceptor";

import type { Wxt } from "wxt";

const PREFIX = chalk.yellow("[MapGenie Dev Server]");

declare global {
  namespace Express {
    export interface Response {
      sendJson(json: string): void;
    }
  }
}

const mapgenieApi = setupCache(
  axios.create({
    baseURL: "https://www.mapgenie.io",
  }),
  {
    interpretHeader: false,
    ttl: Infinity,
  }
);

const stringify = (data: any) => {
  if (data instanceof Error) {
    return JSON.stringify({
      message: data.message,
      name: data.name,
      stack: data.stack,
    });
  } else {
    return JSON.stringify(data);
  }
};

export default function setupServer(
  wxt: Wxt,
  port: number = 8080,
  hostname: string = "localhost"
) {
  const app = express();

  app.use("/api/v1", async (req, res) => {
    const headers = { ...req.headers };
    delete headers.host;

    try {
      const { data, cached } = await mapgenieApi.get(req.originalUrl, {
        headers: headers,
      });

      const cachedText = cached ? chalk.green("Yes") : chalk.red("No");
      wxt.logger.log(
        PREFIX,
        chalk.blue(req.method),
        req.originalUrl,
        `Cached: ${cachedText}`
      );

      res.setHeader("Content-Type", "application/json");
      res.status(200);
      res.send(data);
    } catch (error) {
      let status = 500;
      let data = "";

      if (error instanceof axios.AxiosError) {
        status = error.response?.status || 500;
        data = error.response?.data || "";
      }

      wxt.logger.error(
        PREFIX,
        chalk.blue(req.method),
        req.originalUrl,
        chalk.redBright(stringify(data ?? error))
      );

      res.status(500).send(data ?? stringify(error));
    }
  });

  const server = http.createServer(app);

  server.listen(port, hostname, () => {
    const origin = `http://${hostname}:${port}`;

    wxt.logger.log(PREFIX, `listening on ${chalk.blueBright(origin)}`);
  });
}
