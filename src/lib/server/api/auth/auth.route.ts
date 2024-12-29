import { Hono } from 'hono'
// import { googleAuth, revokeToken } from '@hono/oauth-providers/google';
import { decode, sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { html } from 'hono/html';
import { USER } from '$schema';
import db, { KV } from '$db';
import { eq } from 'drizzle-orm';
import { CookieName, KVEndpoint } from '$constants';
import { env } from '$env/dynamic/private';
import { googleAuth } from '@hono/oauth-providers/google';

const google = new Hono().get('/google', googleAuth({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    scope: ['openid', 'email', 'profile'],
    redirect_uri: env.GOOGLE_REDIRECT_DEVELOPMENT
}), async (c) => {
    const user = c.get('user-google')!
    let userAuth = await db.query.USER.findFirst({
        where: eq(USER.email, user.email!),
    })
    if (!userAuth) {
        await db.insert(USER).values({
            email: user.email!,
            last_login: new Date().toISOString().split('.')[0],
            created_at: new Date().toISOString().split('.')[0]
        })
        userAuth = await db.query.USER.findFirst({
            where: eq(USER.email, user.email!),
            with: {
                role: true
            }
        })
    }
    const secret = await KV.get(KVEndpoint.jwt_secret)! as any
    const signed = await sign({ ...user, id: userAuth!.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15, }, secret)
    setCookie(c, CookieName, signed)
    return c.html(html`<script>window.localStorage.setItem("${CookieName}","${signed}");window.close()</script>`)
}).onError((err, c) => {
    console.error(err)
    return c.html(html`<script>window.localStorage.removeItem("${CookieName}");window.close()</script>`)
})

const logout = new Hono().get('/logout', async (c) => {
    const token = getCookie(c, CookieName)
    if (token) {
        deleteCookie(c, CookieName)
    }
    return c.html(html`<script>window.localStorage.removeItem("${CookieName}");window.location.pathname="${process.env.LOGOUT_REDIRECT_ENDPOINT}"</script>`)
})

const app = new Hono()
    .route("/", google)
    .route("/", logout);

export default app