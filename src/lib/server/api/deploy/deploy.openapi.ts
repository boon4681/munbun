import type { DEPLOYMENT, logTable, USER } from '@/server/db/schema'
import type { ToZodSchema } from '@/server/utils'
import { createRoute, z } from '@hono/zod-openapi'

export const GetAllDeployment = createRoute({
    method: 'get',
    path: '/:project/:name',
    description: 'require token cookie',
    tags: ['deploy'],
    request: {
        params: z.object({
            project: z.string(),
            name: z.string()
        })
    },
    responses: {
        200: {
            description: 'Retrieve all deployment of template',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(
                            z.object({
                                id: z.string(),
                                template_name: z.string(),
                                project: z.string(),
                                description: z.string().nullable(),
                                created_at: z.string(),
                                variables: z.array(z.object({
                                    id: z.string(),
                                    name: z.string(),
                                    value: z.string()
                                })),
                                template: z.string(),
                                message: z.string().nullable()
                            } satisfies ToZodSchema<typeof DEPLOYMENT['$inferSelect']>)
                        )
                    })
                }
            }
        },
        401: {
            description: 'Unauthorized'
        }
    },
})


export const CreateDeployment = createRoute({
    method: 'post',
    path: '/:project/:name',
    description: 'require token cookie',
    tags: ['deploy'],
    request: {
        params: z.object({
            project: z.string(),
            name: z.string()
        })
    },
    responses: {
        200: {
            description: 'Create deployment',
        },
        401: {
            description: 'Unauthorized'
        }
    },
})