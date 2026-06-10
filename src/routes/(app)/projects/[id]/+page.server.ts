import { createClient } from "$lib/client";
import { api } from "$lib/api";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params }) => {
    const client = createClient(fetch).api;
    const project = await api(client.project[":id"].$get)({
        param: { id: params.id },
    }).catch(() => {
        redirect(302, "/projects");
    });
    return { project };
};
