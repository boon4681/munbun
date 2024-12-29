import { OpenAPIHono } from "@hono/zod-openapi";
import type { Variables } from "./api/user/user.type";

export const createHono = () => new OpenAPIHono<{ Variables: Variables }>()