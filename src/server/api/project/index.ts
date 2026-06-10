import { Hono } from "hono";
import { useAuth, type AuthVariables } from "$server/middleware/auth";
import list from "./list";
import create from "./create";
import get from "./get";
import revoke from "./revoke";
import remove from "./remove";

export default new Hono<{ Variables: AuthVariables }>()
    .use("*", useAuth())
    .route("", list)
    .route("", create)
    .route("", get)
    .route("", revoke)
    .route("", remove);
