import { Hono } from "hono";
import providers from "./providers";
import resend from "./resend";
import gmail from "./gmail";

export default new Hono()
.route("", providers)
.route("", resend)
.route("", gmail)
