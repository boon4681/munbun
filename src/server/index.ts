import { Hono } from "hono";
import api from "./api";
import { dbLogger } from "./logger";

export const app = new Hono()
    .use(dbLogger)
    .route("/api", api);
export type App = typeof app;
