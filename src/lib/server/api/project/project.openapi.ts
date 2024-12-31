import { PROJECT } from '@/server/db/schema'
import type { ToZodSchema } from '@/server/utils'
import { createRoute, z } from '@hono/zod-openapi'
import type { ZodType } from 'zod'

export const GetAllProjects = createRoute({
    method: 'get',
    path: '/all',
    description: 'require token cookie',
    tags: ['projects'],
    request: {
    },
    responses: {
        200: {
            description: 'Retrieve all projects data',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(
                            z.object({
                                description: z.string().nullable(),
                                name: z.string(),
                                id: z.string(),
                                created_at: z.string()
                            } satisfies ToZodSchema<Omit<typeof PROJECT['$inferSelect'], 'api_key'>>)
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

export const CreateProject = createRoute({
    method: 'post',
    path: '/create',
    description: 'require token cookie',
    tags: ['projects'],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        name: z.string().min(1).max(32),
                        description: z.string().optional()
                    })
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Create project'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const GetProject = createRoute({
    method: 'get',
    path: '/:id',
    description: 'require token cookie',
    tags: ['projects'],
    request: {
        params: z.object({
            id: z.string()
        })
    },
    responses: {
        200: {
            description: 'Retrieve project data',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.object({
                            description: z.string().nullable(),
                            name: z.string(),
                            id: z.string(),
                            api_key: z.string(),
                            created_at: z.string()
                        } satisfies ToZodSchema<typeof PROJECT['$inferSelect']>)
                    })
                }
            }
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const RevokeProjectAPIKey = createRoute({
    method: 'patch',
    path: '/:id/api-key',
    description: 'require token cookie',
    tags: ['projects'],
    request: {
        params: z.object({
            id: z.string()
        })
    },
    responses: {
        200: {
            description: 'Retrieve project api-key',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.string()
                    })
                }
            }
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const DeleteProject = createRoute({
    method: 'delete',
    path: '/:id',
    description: 'require token cookie',
    tags: ['projects'],
    request: {
        params: z.object({
            id: z.string()
        })
    },
    responses: {
        200: {
            description: 'Delete project'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})