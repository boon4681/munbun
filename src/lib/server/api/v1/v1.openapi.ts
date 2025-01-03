import { createRoute, z } from "@hono/zod-openapi";

export const GetProviders = createRoute({
    method: 'get',
    path: '/providers',
    description: 'require token cookie',
    tags: ['settings'],
    request: {},
    responses: {
        200: {
            description: 'Get resend config',
            content: {
                'application/json': {
                    schema: z.array(z.string())
                }
            }
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const ResendSendEmail = createRoute({
    method: 'post',
    path: '/resend/send',
    description: 'require token cookie',
    tags: ['v1'],
    request: {
        headers: z.object({
            'X-API-KEY': z.string()
        }),
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        subject: z.string(),
                        template: z.string(),
                        from: z.string(),
                        to: z.array(z.string()),
                        data: z.record(z.string(), z.string()),
                        deploy: z.string().optional()
                    })
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Send email'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const GMailSendEmail = createRoute({
    method: 'post',
    path: '/gmail/send',
    description: 'require token cookie',
    tags: ['v1'],
    request: {
        headers: z.object({
            'X-API-KEY': z.string()
        }),
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        subject: z.string(),
                        template: z.string(),
                        to: z.array(z.string()),
                        data: z.record(z.string(), z.string()),
                        deploy: z.string().optional()
                    })
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Send email'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})
