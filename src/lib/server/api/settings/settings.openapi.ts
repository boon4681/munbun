import { createRoute, z } from "@hono/zod-openapi";

export const GetEmailConfig = createRoute({
    method: 'get',
    path: '/resend',
    description: 'require token cookie',
    tags: ['settings'],
    request: {},
    responses: {
        200: {
            description: 'Get resend config',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.object({
                            api_key: z.string()
                        })
                    })
                }
            }
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const SaveEmailConfig = createRoute({
    method: 'post',
    path: '/email',
    description: 'require token cookie',
    tags: ['settings'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        resend_api_key: z.string().optional(),
                        gmail_smtp_user: z.string().optional(),
                        gmail_smtp_pass: z.string().optional()
                    })
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Save resend config'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})