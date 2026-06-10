import { createClient } from "$lib/client";
import { api } from "$lib/api";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params }) => {
    const client = createClient(fetch).api;
    const template = await api(client.template[":project"][":name"].$get)({
        param: { project: params.id, name: params.template },
    }).catch(() => {
        redirect(302, `/projects/${params.id}`);
    });
    return { template };
};
