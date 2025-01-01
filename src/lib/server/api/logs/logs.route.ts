
import { CookieName } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { jwt_secret } from '@/server/jwt';
import { createRouter } from '@/server/utils';
import db from '@/server/db';
import { logTable, PROJECT } from '@/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { GetLogs } from './logs.openapi';

const RouteGetLogs = createRouter().openapi(GetLogs, async (c) => {
    const list = await db.query.logTable.findMany({
        limit: 100,
        orderBy: desc(logTable.created_at)
    })
    return c.json({ data: list })
})

const app = createRouter()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("", RouteGetLogs)

export default app