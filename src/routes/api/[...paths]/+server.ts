import backend from '@/server/server';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request }) => backend.fetch(request);
export const POST: RequestHandler = ({ request }) => backend.fetch(request);
export const PUT: RequestHandler = ({ request }) => backend.fetch(request);
export const PATCH: RequestHandler = ({ request }) => backend.fetch(request);
export const DELETE: RequestHandler = ({ request }) => backend.fetch(request);