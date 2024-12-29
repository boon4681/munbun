import { createRoute, z } from '@hono/zod-openapi'

export const GetMeUser = createRoute({
    method: 'get',
    path: '/@me',
    description: 'require token cookie',
    tags: ['user'],
    request: {
    },
    responses: {
        200: {
            description: 'Retrieve the user data'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})