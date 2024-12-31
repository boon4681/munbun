
import { CookieName, KVEndpoint } from '@/server/constants';
import { useAuth } from '@/server/middleware/auth';
import { jwt_secret } from '@/server/jwt';
import { createRouter } from '@/server/utils';
import db, { KV } from '@/server/db';
import { GetEmailConfig, SaveEmailConfig } from './settings.openapi';

const RouteGetEmailConfig = createRouter().openapi(GetEmailConfig, async (c) => {
    return c.json({
        data: {
            api_key: await KV.get(KVEndpoint.resend_api_key)
        }
    })
})

const RouteSaveEmailConfig = createRouter().openapi(SaveEmailConfig, async (c) => {
    const validated = c.req.valid("json")
    if (validated.resend_api_key) {
        await KV.set(KVEndpoint.resend_api_key, validated.resend_api_key)
    }
    if (validated.gmail_smtp_user) {
        await KV.set(KVEndpoint.gmail_smtp_user, validated.gmail_smtp_user)
    }
    if (validated.gmail_smtp_pass) {
        await KV.set(KVEndpoint.gmail_smtp_pass, validated.gmail_smtp_pass)
    }
    return c.json({
        message: "Email config saved",
        data: ""
    })
})

const app = createRouter()
    .use('*', useAuth({ jwt: { secret: jwt_secret, cookie: CookieName } }))
    .route("", RouteGetEmailConfig)
    .route("", RouteSaveEmailConfig)

export default app