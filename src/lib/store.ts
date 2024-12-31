import { writable } from "svelte/store";
import type { User } from "./api";

export const sidebar = writable(false);

export const settings = writable({
    preference: {
        display: {
            text: "code",
            image: "jpg,tiff,jpeg,png,gif,bmp,svg,ico,swf,webp",
            audio: "mp3,flac,ogg,m4a,wav,opus,wma",
            video: "mp4,mkv,avi,mov,rmvb,webm,flv,m3u8"
        }
    }
})

export const ready = writable<boolean>(false)
export const me = writable<User>()
export const slashVisible = writable(false);
export const slashItems = writable([]);
export const slashLocaltion = writable({ x: 0, y: 0, height: 0 });
export const slashProps = writable({ editor: null, range: null });
export const desktopMenu = writable(true);
export const components = writable([]);
export const editorWidth = writable(0);
