<script lang="ts">
	import "../app.css";
	import { Toaster } from "svelte-sonner";
	import type { LayoutServerData } from "./$types";
	import MunbunLogin from "@/components/munbun/auth/munbun-login.svelte";
	import { ModeWatcher } from "mode-watcher";
</script>

<ModeWatcher track={false} />
<Toaster />
<slot></slot>
