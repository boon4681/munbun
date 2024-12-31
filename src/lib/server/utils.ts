import { OpenAPIHono, z } from "@hono/zod-openapi";
import type { Variables } from "./api/user/user.type";

export const createRouter = () => new OpenAPIHono<{ Variables: Variables }>()

type IsNullable<T> = Extract<T, null> extends never ? false : true
type IsOptional<T> = Extract<T, undefined> extends never ? false : true

{
    type T1 = IsNullable<string> // false
    type T2 = IsNullable<string | null> // true
    type T3 = IsNullable<string | undefined> // false
    type T4 = IsNullable<string | null | undefined> // true

    type T5 = IsOptional<string> // false
    type T6 = IsOptional<string | null> // false
    type T7 = IsOptional<string | undefined> // true
    type T8 = IsOptional<string | null | undefined> // true
}

type ZodWithEffects<T extends z.ZodTypeAny> = T | z.ZodEffects<T, unknown, unknown>

export type ToZodSchema<T extends Record<string, any>> = {
    [K in keyof T]-?: IsNullable<T[K]> extends true
    ? ZodWithEffects<z.ZodNullable<z.ZodType<T[K]>>>
    : IsOptional<T[K]> extends true
    ? ZodWithEffects<z.ZodOptional<z.ZodType<T[K]>>>
    : ZodWithEffects<z.ZodType<T[K]>>
}
