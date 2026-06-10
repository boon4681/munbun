import { Hono } from "hono";
import { useAuth, type AuthVariables } from "$server/middleware/auth";
import getEmail from "./get-email";
import saveEmail from "./save-email";

export default new Hono<{ Variables: AuthVariables }>()
    .use("*", useAuth())
    .route("", getEmail)
    .route("", saveEmail);
