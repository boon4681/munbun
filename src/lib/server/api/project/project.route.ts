
import { CookieName } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { CreateProject, DeleteProject, GetAllProjects, GetProject, RevokeProjectAPIKey } from './project.openapi';
import { jwt_secret } from '@/server/jwt';
import { createRouter } from '@/server/utils';
import db from '@/server/db';
import { PROJECT } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

const RouteGetAllProjects = createRouter().openapi(GetAllProjects, async (c) => {
    const list = await db.query.PROJECT.findMany({
        columns: {
            name: true,
            description: true,
            id: true,
            created_at: true
        }
    })
    return c.json({ data: list })
})

const RouteCreateProject = createRouter().openapi(CreateProject, async (c) => {
    const validated = c.req.valid('json')
    await db.insert(PROJECT).values({
        name: validated.name,
        description: validated.description
    })
    return c.json({ message: "Project created" })
})

const RouteGetProject = createRouter().openapi(GetProject, async (c) => {
    const validated = c.req.valid('param')
    const project = await db.query.PROJECT.findFirst({
        where: eq(PROJECT.id, validated.id)
    })
    if (project) {
        return c.json({ data: project })
    }
    return c.json({ message: "Project not found" }, 404)
})

const RouteRevokeProjectAPIKey = createRouter().openapi(RevokeProjectAPIKey, async (c) => {
    const validated = c.req.valid('param')
    const project = await db.query.PROJECT.findFirst({
        where: eq(PROJECT.id, validated.id)
    })
    if (project) {
        await db.update(PROJECT).set({
            api_key: [createId(), createId(), createId()].join(".")
        }).where(eq(PROJECT.id, validated.id))
        return c.json({ data: project.api_key })
    }
    return c.json({ message: "Project not found" }, 404)
})

const RouteDeleteProject = createRouter().openapi(DeleteProject, async (c) => {
    const validated = c.req.valid('param')
    const project = await db.query.PROJECT.findFirst({
        where: eq(PROJECT.id, validated.id)
    })
    if (project) {
        await db.delete(PROJECT).where(eq(PROJECT.id, validated.id))
        return c.json({ message: "Project created" })
    }
    return c.json({ message: "Project not found" }, 404)
})

const app = createRouter()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("", RouteGetAllProjects)
    .route("", RouteCreateProject)
    .route("", RouteGetProject)
    .route("", RouteRevokeProjectAPIKey)
    .route("", RouteDeleteProject)

export default app