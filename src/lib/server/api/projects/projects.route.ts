
import { CookieName } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { OpenAPIHono } from '@hono/zod-openapi';
import type { Variables } from '../user/user.type';
import { GetAllProjects } from './projects.openapi';
import { env } from '$env/dynamic/private';
import { jwt_secret } from '@/server/jwt';

const RouteGetAllProjects = new OpenAPIHono<{ Variables: Variables }>().openapi(GetAllProjects, async (c) => {
    return c.json(c.get('user'))
})

const app = new OpenAPIHono<{ Variables: Variables }>()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("/", RouteGetAllProjects)

export default app