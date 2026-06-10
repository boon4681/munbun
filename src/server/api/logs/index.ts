import { Hono } from "hono";
import { useAuth, type AuthVariables } from "$server/middleware/auth";
import list from "./list";

export default new Hono<{ Variables: AuthVariables }>().use("*", useAuth()).route("", list);
