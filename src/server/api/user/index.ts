import { Hono } from "hono";
import { useAuth, type AuthVariables } from "$server/middleware/auth";
import me from "./me";
import list from "./list";
import create from "./create";
import remove from "./remove";

export default new Hono<{ Variables: AuthVariables }>()
    .use("*", useAuth())
    .route("", me)
    .route("", list)
    .route("", create)
    .route("", remove);
