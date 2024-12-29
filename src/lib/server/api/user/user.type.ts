import { USER } from "@/server/db/schema";

export type Variables = { user: typeof USER.$inferSelect }