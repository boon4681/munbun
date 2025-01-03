import db from "@/server/db"
import { createRouter } from "@/server/utils"
import { CreateDeployment, GetAllDeployment } from "./deploy.openapi"
import { and, desc, eq } from "drizzle-orm"
import { DEPLOYMENT, TEMPLATE } from "@/server/db/schema"
import { useAuth } from "@/server/middleware/auth"
import { jwt_secret } from "@/server/jwt"
import { CookieName } from "@/server/constants"
import mjml2html from 'mjml'


const RouteGetAllDeployment = createRouter().openapi(GetAllDeployment, async (c) => {
    const params = c.req.valid('param')
    const template = await db.query.TEMPLATE.findFirst({
        where: and(
            eq(TEMPLATE.project, params.project),
            eq(TEMPLATE.name, params.name)
        )
    })
    if (!template) return c.json({ message: "Project or Template not found" }, 404)
    const deployment = await db.query.DEPLOYMENT.findMany({
        where: and(
            eq(DEPLOYMENT.project, params.project),
            eq(DEPLOYMENT.template_name, params.name)
        ),
        orderBy: desc(DEPLOYMENT.created_at)
    })
    return c.json({ data: deployment })
})

const RouteCreateDeployment = createRouter().openapi(CreateDeployment, async (c) => {
    const params = c.req.valid('param')
    const template = await db.query.TEMPLATE.findFirst({
        where: and(
            eq(TEMPLATE.project, params.project),
            eq(TEMPLATE.name, params.name)
        )
    })
    if (!template) return c.json({ message: "Project or Template not found" }, 404)
    let compiled = false
    try {
        let mjml = (template.template ?? "")
        for (const item of template.variables) {
            mjml = mjml.replaceAll("{{" + item.name + "}}", item.value)
        }
        mjml2html(mjml)
        compiled = true
    } catch (error) {
        compiled = false
    }
    await db.insert(DEPLOYMENT).values({
        project: template.project,
        template_name: template.name,
        template: template.template ?? "",
        variables: template.variables,
        message: compiled ? "Success" : "Built-failed"
    } satisfies typeof DEPLOYMENT['$inferInsert'])
    if (compiled) {
        return c.json({ message: "Deployed" })
    } else {
        return c.json({ message: "Template built-failed" }, 500)
    }
})

const app = createRouter()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("", RouteGetAllDeployment)
    .route("", RouteCreateDeployment)

export default app