<script lang="ts">
    import { generateGradient } from "$lib/utils.js";

    export let size = 128;
    export let text:string = ""
    const gradient = generateGradient(text || Math.random() + "");
</script>

<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g>
        <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color={gradient.fromColor} />
                <stop offset="100%" stop-color={gradient.toColor} />
            </linearGradient>
        </defs>
        <rect fill="url(#gradient)" x="0" y="0" width={size} height={size} />
    </g>
</svg>