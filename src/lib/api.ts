import type { ClientRequest, ClientRequestOptions, ClientResponse } from "hono/client";
import { createClient } from "./client";
import type { StripResponse } from "./utils";
import { api } from "./api.utils";

export type Project = StripResponse<typeof GetAllProjects>[number]
export type Template = StripResponse<typeof GetAllTemplates>[number]
export type User = StripResponse<typeof GetMe>
export type Log = StripResponse<typeof GetLogs>[number]
export type Deploy = StripResponse<typeof GetAllDeployment>[number]

const client = createClient(fetch)
const GetMe = api(client.user["@me"].$get)
const GetAllUsers = api(client.user.all.$get)
const CreateUser = api(client.user.$post)
const DeleteUser = api(client.user.$delete)

const GetAllProjects = api(client.project.all.$get)
const GetProject = api(client.project[":id"].$get)
const RevokeProjectAPIKey = api(client.project[":id"]["api-key"].$patch)
const DeleteProject = api(client.project[":id"].$delete)
const CreateProject = api(client.project.create.$post)

const GetAllTemplates = api(client.template[":project"].all.$get)
const CreateTemplate = api(client.template[":project"].create.$post)
const DeleteTemplate = api(client.template[":project"][":name"].$delete)
const SaveTemplate = api(client.template[":project"][":name"].save.$post)

const SaveEmailConfig = api(client.settings['email'].$post)

const GetLogs = api(client.logs.logs.$get)
const GetAllDeployment = api(client.deploy[":project"][":name"].$get)
const CreateDeployment = api(client.deploy[":project"][":name"].$post)

const V1GetProviders = api(client.v1.providers.$get)

const ClientAPI = {
    // user
    GetMe,
    GetAllUsers,
    CreateUser,
    DeleteUser,
    // projects
    GetAllProjects,
    GetProject,
    RevokeProjectAPIKey,
    DeleteProject,
    CreateProject,
    // templates
    GetAllTemplates,
    CreateTemplate,
    SaveTemplate,
    DeleteTemplate,
    // settings
    SaveEmailConfig,
    // logs
    GetLogs,
    // deployment
    GetAllDeployment,
    CreateDeployment,
    // v1
    V1GetProviders
}

export { ClientAPI as client }