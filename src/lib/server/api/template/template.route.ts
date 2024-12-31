
import { CookieName } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { jwt_secret } from '@/server/jwt';
import { createRouter } from '@/server/utils';
import db from '@/server/db';
import { PROJECT, TEMPLATE } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { CreateTemplate, DeleteTemplate, GetAllTemplates, GetTemplate, SaveTemplate } from './template.openapi';
import { Maily } from '@/server/maily';
import mjml2html from 'mjml'
const RouteGetAllTemplates = createRouter().openapi(GetAllTemplates, async (c) => {
    const params = c.req.valid('param')
    const list = await db.query.TEMPLATE.findMany({
        where: eq(TEMPLATE.project, params.project)
    })
    return c.json({ data: list })
})

const RouteGetTemplate = createRouter().openapi(GetTemplate, async (c) => {
    const params = c.req.valid('param')
    const template = await db.query.TEMPLATE.findFirst({
        where: and(
            eq(TEMPLATE.project, params.project),
            eq(TEMPLATE.name, params.name)
        )
    })
    if (template) {
        return c.json({ data: template })
    }
    return c.json({ message: "Template not found" }, 404)
})

const RouteCreateTemplate = createRouter().openapi(CreateTemplate, async (c) => {
    const validated = c.req.valid('json')
    const params = c.req.valid('param')
    const project = await db.query.PROJECT.findFirst({
        where: eq(PROJECT.id, params.project)
    })
    if (!project) return c.json({ message: "Project not found" }, 404)
    await db.insert(TEMPLATE).values({
        project: params.project,
        name: validated.name,
        description: validated.description
    })
    return c.json({ message: "Template created" })
})

const RouteRenderTemplate = createRouter().openapi(SaveTemplate, async (c) => {
    const content = c.req.valid("json")
    const params = c.req.valid('param')
    const template = await db.query.TEMPLATE.findFirst({
        where: and(
            eq(TEMPLATE.project, params.project),
            eq(TEMPLATE.name, params.name)
        )
    })
    if (!template) return c.json({ message: "Template not found" }, 404)
    const updated = await db.update(TEMPLATE).set({
        template: content.mjml,
        variables: content.variables
    }).where(and(
        eq(TEMPLATE.project, params.project),
        eq(TEMPLATE.name, params.name)
    )).returning()
    if (updated.length == 0) return c.json({ data: "" })
    try {
        let mjml = (updated[0].template ?? "")
        for (const item of updated[0].variables) {
            mjml = mjml.replaceAll("{{" + item.name + "}}", item.value)
        }
        const result = mjml2html(mjml)
        return c.json({
            data: result.html
        })
    } catch (error) {
        return c.json({
            message: "Invalid mjml",
            data: ""
        })
    }
    // const maily = new Maily(content);
    // maily.setVariableValue('name', 'John Doe');
    // const result = await maily.render({});
    // return c.json({
    //     data: result
    // })
})

const RouteDeleteTemplate = createRouter().openapi(DeleteTemplate, async (c) => {
    const params = c.req.valid('param')
    const template = await db.query.TEMPLATE.findFirst({
        where: and(
            eq(TEMPLATE.project, params.project),
            eq(TEMPLATE.name, params.name)
        )
    })
    if (template) {
        await db.delete(TEMPLATE).where(and(
            eq(TEMPLATE.project, params.project),
            eq(TEMPLATE.name, params.name)
        ))
        return c.json({ message: "Template deleted" })
    }
    return c.json({ message: "Project not found" }, 404)
})

const app = createRouter()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("", RouteGetAllTemplates)
    .route("", RouteCreateTemplate)
    .route("", RouteGetTemplate)
    .route("", RouteRenderTemplate)
    .route("", RouteDeleteTemplate)

export default app