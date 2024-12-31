import { Hono } from "hono";
import AuthRoute from "$server/api/auth/auth.route"
import UserRoute from "$server/api/user/user.route"
import ProjectRoute from "$server/api/project/project.route"
import TemplateRoute from "$server/api/template/template.route"
import SettingsRoute from "$server/api/settings/settings.route"
import V1Route from "$server/api/v1/v1.route"

const router = new Hono()
    .route('/auth', AuthRoute)
    .route('/user', UserRoute)
    .route('/project', ProjectRoute)
    .route('/template', TemplateRoute)
    .route('/settings', SettingsRoute)
    .route('/v1', V1Route);

// router.doc('/developer/doc', {
//     openapi: '3.0.0',
//     info: {
//         version: '1.0.0',
//         title: 'Munbun',
//     },
// })

const app = new Hono().route('/api', router)

// app.get('/developer/docs', swaggerUI({ url: '/api/developer/doc' }));

export default app
export type HonoServer = typeof router