import { CookieName } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { GetMeUser } from './user.openapi';
import { jwt_secret } from '@/server/jwt';
import { createRouter } from '@/server/utils';

const RouteGetMeUser = createRouter().openapi(GetMeUser, async (c) => {
    return c.json({
        data: c.get('user')
    })
})

const app = createRouter()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("/", RouteGetMeUser)

export default app