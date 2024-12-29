import { createRoute, z } from '@hono/zod-openapi'

export const GetAllProjects = createRoute({
    method: 'get',
    path: '/all',
    description: 'require token cookie',
    tags: ['projects'],
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