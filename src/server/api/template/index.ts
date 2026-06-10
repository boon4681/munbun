import { Hono } from "hono";
import { useAuth, type AuthVariables } from "$server/middleware/auth";
import list from "./list";
import create from "./create";
import get from "./get";
import save from "./save";
import test from "./test";
import remove from "./remove";

export default new Hono<{ Variables: AuthVariables }>()
    .use("*", useAuth())
    .route("", list)
    .route("", create)
    .route("", get)
    .route("", save)
    .route("", test)
    .route("", remove);
