import { Hono } from "hono";
import google from "./google";
import logout from "./logout";

export default new Hono().route("/", google).route("/", logout);
