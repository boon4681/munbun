import { PROJECT, TEMPLATE } from '@/server/db/schema'
import type { ToZodSchema } from '@/server/utils'
import { createRoute, z } from '@hono/zod-openapi'

export const GetAllTemplates = createRoute({
    method: 'get',
    path: '/:project/all',
    description: 'require token cookie',
    tags: ['templates'],
    request: {
        params: z.object({
            project: z.string()
        })
    },
    responses: {
        200: {
            description: 'Retrieve all templates data',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(
                            z.object({
                                name: z.string(),
                                description: z.string().nullable(),
                                project: z.string(),
                                created_at: z.string(),
                                template: z.string().nullable(),
                                variables: z.array(z.object({
                                    id: z.string(),
                                    name: z.string(),
                                    value: z.string()
                                })),
                            } satisfies ToZodSchema<typeof TEMPLATE['$inferSelect']>)
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

export const CreateTemplate = createRoute({
    method: 'post',
    path: '/:project/create',
    description: 'require token cookie',
    tags: ['templates'],
    request: {
        params: z.object({
            project: z.string()
        }),
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
            description: 'Create template'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const GetTemplate = createRoute({
    method: 'get',
    path: '/:project/:name',
    description: 'require token cookie',
    tags: ['templates'],
    request: {
        params: z.object({
            project: z.string(),
            name: z.string()
        })
    },
    responses: {
        200: {
            description: 'Retrieve template data',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.object({
                            description: z.string().nullable(),
                            name: z.string(),
                            created_at: z.string(),
                            project: z.string(),
                            template: z.string().nullable(),
                            variables: z.array(z.object({
                                id: z.string(),
                                name: z.string(),
                                value: z.string()
                            })),
                        } satisfies ToZodSchema<typeof TEMPLATE['$inferSelect']>)
                    })
                }
            }
        },
        401: {
            description: 'Unauthorized'
        }
    },
})

export const SaveTemplate = createRoute({
    method: 'post',
    path: '/:project/:name/save',
    description: 'require token cookie',
    tags: ['projects'],
    request: {
        params: z.object({
            project: z.string(),
            name: z.string()
        }),
        body: {
            content: {
                'application/json': {
                    'schema': z.object({
                        mjml: z.any().optional(),
                        variables: z.array(z.object({
                            id: z.string(),
                            name: z.string(),
                            value: z.string()
                        })).default([]).optional(),
                    })
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Retrieve project data',
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

export const DeleteTemplate = createRoute({
    method: 'delete',
    path: '/:project/:name',
    description: 'require token cookie',
    tags: ['templates'],
    request: {
        params: z.object({
            project: z.string(),
            name: z.string()
        })
    },
    responses: {
        200: {
            description: 'Retrieve template data'
        },
        401: {
            description: 'Unauthorized'
        }
    },
})