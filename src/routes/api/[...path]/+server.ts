import { app } from "$server"
import type { RequestHandler } from "@sveltejs/kit"


export const fallback: RequestHandler = ({ request }) => app.fetch(request)
