import { Hono } from "hono";
import AuthRoute from "$server/api/auth/auth.route"
import UserRoute from "$server/api/user/user.route"

const router = new Hono()
    .route('/auth', AuthRoute)
    .route('/user', UserRoute)

const app = new Hono().route('/api', router)

export default app
export type HonoServer = typeof router