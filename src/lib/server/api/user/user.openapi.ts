import type { USER } from '@/server/db/schema'
import type { ToZodSchema } from '@/server/utils'
import { createRoute, z } from '@hono/zod-openapi'

export const GetMeUser = createRoute({
    method: 'get',
    path: '/@me',
    description: 'require token cookie',
    tags: ['users'],
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

export const GetAllUsers = createRoute({
    method: 'get',
    path: '/all',
    description: 'require token cookie',
    tags: ['users'],
    request: {
    },
    responses: {
        200: {
            description: 'Retrieve all users data',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(
                            z.object({
                                id: z.string(),
                                email: z.string(),
                                role: z.string(),
                                last_login: z.string().nullable(),
                                created_at: z.string()
                            } satisfies ToZodSchema<typeof USER['$inferSelect']>)
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

export const CreateUser = createRoute({
    method: 'post',
    path: '/',
    description: 'require token cookie',
    tags: ['users'],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        email: z.string().email()
                    })
                }
            }
        }
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

export const DeleteUser = createRoute({
    method: 'delete',
    path: '/',
    description: 'require token cookie',
    tags: ['users'],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        email: z.string().email()
                    })
                }
            }
        }
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