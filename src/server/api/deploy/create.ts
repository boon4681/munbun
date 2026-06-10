import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import mjml2html from "mjml";
import { db } from "$server/db";
import { DEPLOYMENT, TEMPLATE } from "$server/db/schema";

export default new Hono().post(
    "/:project/:name",
    zValidator("param", z.object({ project: z.string(), name: z.string() })),
    async (c) => {
        const params = c.req.valid("param");
        const template = await db.query.TEMPLATE.findFirst({
            where: and(eq(TEMPLATE.project, params.project), eq(TEMPLATE.name, params.name)),
        });
        if (!template) return c.json({ message: "Project or Template not found" }, 404);
        let compiled = false;
        let result = "";
        try {
            let mjml = template.template ?? "";
            for (const item of template.variables) {
                mjml = mjml.replaceAll("{{" + item.name + "}}", item.value);
            }
            result = (await mjml2html(mjml)).html;
            compiled = true;
        } catch (error) {
            compiled = false;
        }
        await db.insert(DEPLOYMENT).values({
            project: template.project,
            template_name: template.name,
            template: template.template ?? "",
            variables: template.variables,
            message: compiled ? "Success" : "Built-failed",
            preview: result,
        } satisfies (typeof DEPLOYMENT)["$inferInsert"]);
        if (compiled) {
            return c.json({ message: "Deployed" });
        } else {
            return c.json({ message: "Template built-failed" }, 500);
        }
    },
);
