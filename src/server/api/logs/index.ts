import { Hono } from "hono";
import { useAuth, type AuthVariables } from "$server/middleware/auth";
import list from "./list";
import stats from "./stats";
import emailStats from "./email-stats";

export default new Hono<{ Variables: AuthVariables }>()
    .use("*", useAuth())
    .route("", list)
    .route("/stats", stats)
    .route("", emailStats);
