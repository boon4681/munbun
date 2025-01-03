import { Hono } from "hono";
import { logger } from 'hono/logger'
import AuthRoute from "$server/api/auth/auth.route"
import UserRoute from "$server/api/user/user.route"
import ProjectRoute from "$server/api/project/project.route"
import TemplateRoute from "$server/api/template/template.route"
import SettingsRoute from "$server/api/settings/settings.route"
import LogsRoute from "$server/api/logs/logs.route"
import V1Route from "$server/api/v1/v1.route"
import DeploymentRoute from "$server/api/deploy/deploy.route"
import { dbLogger } from "./logger";

const router = new Hono()
    .route('/auth', AuthRoute)
    .route('/user', UserRoute)
    .route('/project', ProjectRoute)
    .route('/template', TemplateRoute)
    .route('/settings', SettingsRoute)
    .route('/logs', LogsRoute)
    .route('/deploy', DeploymentRoute)
    .route('/v1', V1Route)

// router.doc('/developer/doc', {
//     openapi: '3.0.0',
//     info: {
//         version: '1.0.0',
//         title: 'Munbun',
//     },
// })

const app = new Hono().use(dbLogger).route('/api', router)

// app.get('/developer/docs', swaggerUI({ url: '/api/developer/doc' }));

export default app
export type HonoServer = typeof router