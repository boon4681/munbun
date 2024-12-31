import { createClient } from "@/client";
import type { PageServerLoad } from "./$types";
import { api } from "@/api.utils";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, params }) => {
    const client = createClient(fetch)
    const project = await api(client.project[":id"].$get)({
        param: {
            id: params.id.split("-")[1]
        }
    }).catch((e) => {
        throw redirect(304, '/')
    })
    return {
        project: project
    }
}