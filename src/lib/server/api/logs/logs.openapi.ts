import type { logTable, USER } from '@/server/db/schema'
import type { ToZodSchema } from '@/server/utils'
import { createRoute, z } from '@hono/zod-openapi'

export const GetLogs = createRoute({
    method: 'get',
    path: '/logs',
    description: 'require token cookie',
    tags: ['logs'],
    request: {
    },
    responses: {
        200: {
            description: 'Retrieve the user data',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(
                            z.object({
                                id: z.string(),
                                created_at: z.string(),
                                message: z.string(),
                                status: z.string(),
                                tag: z.string()
                            } satisfies ToZodSchema<typeof logTable['$inferSelect']>)
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