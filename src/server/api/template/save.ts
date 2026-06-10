import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import mjml2html from "mjml";
import { db } from "$server/db";
import { TEMPLATE } from "$server/db/schema";

const variable = z.object({ id: z.string(), name: z.string(), value: z.string() });

export default new Hono().post(
    "/:project/:name/save",
    zValidator("param", z.object({ project: z.string(), name: z.string() })),
    zValidator(
        "json",
        z.object({
            mjml: z.string().optional(),
            // No `.default()` here: an omitted `variables` must stay `undefined`
            // so a mjml-only save (the editor autosave) doesn't wipe variables,
            // and a variables-only save doesn't wipe the template.
            variables: z.array(variable).optional(),
        }),
    ),
    async (c) => {
        const params = c.req.valid("param");
        const content = c.req.valid("json");
        const template = await db.query.TEMPLATE.findFirst({
            where: and(eq(TEMPLATE.project, params.project), eq(TEMPLATE.name, params.name)),
        });
        if (!template) return c.json({ message: "Template not found" }, 404);
        const updated = await db
            .update(TEMPLATE)
            .set({ template: content.mjml, variables: content.variables })
            .where(and(eq(TEMPLATE.project, params.project), eq(TEMPLATE.name, params.name)))
            .returning();
        if (updated.length == 0) return c.json({ data: "" });
        try {
            let mjml = updated[0].template ?? "";
            for (const item of updated[0].variables) {
                mjml = mjml.replaceAll("{{" + item.name + "}}", item.value);
            }
            const result = await mjml2html(mjml);
            return c.json({ data: result.html });
        } catch (error) {
            return c.json({ message: "Invalid mjml", data: "" });
        }
    },
);
