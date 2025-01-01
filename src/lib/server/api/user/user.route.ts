import { CookieName } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { CreateUser, DeleteUser, GetAllUsers, GetMeUser } from './user.openapi';
import { jwt_secret } from '@/server/jwt';
import { createRouter } from '@/server/utils';
import db from '@/server/db';
import { eq } from 'drizzle-orm';
import { USER } from '@/server/db/schema';

const RouteGetMeUser = createRouter().openapi(GetMeUser, async (c) => {
    return c.json({
        data: c.get('user')
    })
})

const RouteGetAllUser = createRouter().openapi(GetAllUsers, async (c) => {
    const users = await db.query.USER.findMany()
    return c.json({
        data: users
    })
})

const RouteCreateUser = createRouter().openapi(CreateUser, async (c) => {
    const validated = c.req.valid('json')
    const user = await db.query.USER.findFirst({
        where: eq(USER.email, validated.email)
    })
    if (user) return c.json({ message: "This user is already exist" }, 400)
    await db.insert(USER).values({
        email: validated.email
    })
    return c.json({ data: "" })
})

const RouteDeleteUser = createRouter().openapi(DeleteUser, async (c) => {
    const me = c.get('user');
    const validated = c.req.valid('json')
    const user = await db.query.USER.findFirst({
        where: eq(USER.email, validated.email)
    })
    if (!user) return c.json({ message: "User not found" }, 404)
    if (user.email == me.email) return c.json({ message: "You cannot remove yourself" }, 400)
    await db.delete(USER).where(eq(USER.email, validated.email))
    return c.json({ data: "" })
})

const app = createRouter()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("", RouteGetMeUser)
    .route("", RouteGetAllUser)
    .route("", RouteCreateUser)
    .route("", RouteDeleteUser)

export default app