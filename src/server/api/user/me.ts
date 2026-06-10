import { Hono } from "hono";
import type { AuthVariables } from "$server/middleware/auth";

export default new Hono<{ Variables: AuthVariables }>().get("/@me", (c) => {
    return c.json({ data: c.get("user") });
});
