import type { USER } from '@/server/db/schema'
import type { ToZodSchema } from '@/server/utils'
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
            description: 'Retrieve the user data',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.object({
                            id: z.string(),
                            email: z.string(),
                            role: z.string(),
                            last_login: z.string().nullable(),
                            created_at: z.string()
                        } satisfies ToZodSchema<typeof USER['$inferSelect']>)
                    })
                }
            }
        },
        401: {
            description: 'Unauthorized'
        }
    },
})