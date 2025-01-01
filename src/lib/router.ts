import type { Path } from "@/paths";
import Fingerprint from "lucide-svelte/icons/fingerprint";
import Monitor from "lucide-svelte/icons/monitor";
import Grid2x2 from "lucide-svelte/icons/grid-2x2";
import Bolt from "lucide-svelte/icons/bolt";
import User from "lucide-svelte/icons/user";

export const router = (): Record<string, Path[]> | Record<string, Path[]> => {
    return {
        "": [
            {
                name: "Projects",
                to: "/",
                match: ["/", "/projects/:id", "/projects/:id/:template"],
                icon: Grid2x2,
            },
            {
                name: "Logs",
                to: "/logs",
                match: "/logs",
                icon: Monitor,
            },
            {
                name: "Users",
                to: "/users",
                match: "/users",
                icon: User,
            },
            {
                name: "Settings",
                to: "/settings",
                match: ["/settings", "/settings/:id"],
                icon: Bolt,
            },
        ],
    };
}