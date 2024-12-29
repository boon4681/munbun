import { writable } from "svelte/store";

export const sidebar = writable(true);

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