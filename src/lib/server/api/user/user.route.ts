import { CookieName } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { OpenAPIHono } from '@hono/zod-openapi';
import { GetMeUser } from './user.openapi';
import type { Variables } from './user.type';
import { env } from '$env/dynamic/private';
import { jwt_secret } from '@/server/jwt';
import { createHono } from '@/server/utils';

const RouteGetMeUser = createHono().openapi(GetMeUser, async (c) => {
    return c.json(c.get('user'))
})

const app = new OpenAPIHono<{ Variables: Variables }>()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("/", RouteGetMeUser)

export default app