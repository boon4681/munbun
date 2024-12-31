import { createClient } from "@/client";
import type { PageServerLoad } from "./$types";
import { api } from "@/api.utils";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, params }) => {
    const client = createClient(fetch)
    const template = await api(client.template[":project"][":name"].$get)({
        param: {
            project: params.id.split("-")[1],
            name: params.template
        }
    }).catch((e) => {
        throw redirect(304, '/')
    })
    return {
        template: template
    }
}