// place files you want to import through the `$lib` alias in this folder.

import { createClient } from "./server/client";

export const client = createClient(fetch)