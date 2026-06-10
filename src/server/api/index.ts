import { Hono } from "hono";
import auth from "./auth";
import user from "./user";
import project from "./project";
import template from "./template";
import settings from "./settings";
import logs from "./logs";
import deploy from "./deploy";
import v1 from "./v1";

export default new Hono()
    .route("/auth", auth)
    .route("/user", user)
    .route("/project", project)
    .route("/template", template)
    .route("/settings", settings)
    .route("/logs", logs)
    .route("/deploy", deploy)
    .route("/v1", v1);
