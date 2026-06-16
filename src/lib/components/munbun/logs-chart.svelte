<script lang="ts">
    import { onMount } from "svelte";
    import "uplot/dist/uPlot.min.css";
    import type uPlot from "uplot";
    import { parseSqliteDate } from "$lib/utils";
    import { DateTime } from "luxon";

    type Log = {
        id: string;
        tag: string;
        status: string;
        message: string;
        created_at: string;
    };

    type LogStat = {
        date: string;
        total: number;
        errors: number;
        avgMs: number | null;
    };

    type ChartData = {
        aligned: uPlot.AlignedData;
        total: number;
        errors: number;
        averageMs: number | null;
        bucketMs: number;
    };

    type RangeKey = "1d" | "3d" | "7d" | "14d" | "30d";

    const rangeOptions: { key: RangeKey; label: string; days: number }[] = [
        { key: "1d", label: "1D", days: 1 },
        { key: "3d", label: "3D", days: 3 },
        { key: "7d", label: "7D", days: 7 },
        { key: "14d", label: "14D", days: 14 },
        { key: "30d", label: "30D", days: 30 },
    ];

    let { logs, stats, range = "3d", onrangechange }: { logs: Log[]; stats: LogStat[]; range?: RangeKey; onrangechange?: (key: RangeKey) => void } = $props();

    let chartEl: HTMLDivElement;
    let shellEl: HTMLDivElement;
    let panelEl: HTMLElement;
    let UPlot: typeof uPlot | null = null;
    let uPlotPaths: uPlot.Series.PathBuilderFactories | null = null;
    let chart: uPlot | null = null;
    let resizeObserver: ResizeObserver | null = null;

    let zoom = $state<{ min?: number; max?: number }>({});
    let zoomed = $derived(!!(zoom.min != null && zoom.max != null));

    let tooltip = $state({
        show: false,
        left: 0,
        top: 0,
        total: 0,
        label: "",
    });

    let prevRange: RangeKey | null = null;

    const chartData = $derived(buildChartData(stats));

    $effect(() => {
        if (!UPlot || !chartEl) return;
        chartData;
        range;

        if (range !== prevRange) {
            prevRange = range;
            initChart();
        } else if (chart && chartData.aligned[0].length) {
            chart.setData(chartData.aligned);
        }
    });

    onMount(() => {
        let disposed = false;

        void import("uplot").then((mod) => {
            if (disposed) return;
            UPlot = mod.default;
            uPlotPaths = mod.default.paths;
            initChart();
        });

        resizeObserver = new ResizeObserver(() => resizeChart());
        resizeObserver.observe(panelEl);

        return () => {
            disposed = true;
            resizeObserver?.disconnect();
            chart?.destroy();
            chart = null;
        };
    });

    function initChart() {
        if (!UPlot || !chartEl || !chartData.aligned[0].length) return;

        chart?.destroy();
        chart = new UPlot(buildOptions(chartData.aligned), chartData.aligned, chartEl);
    }

    function resizeChart() {
        if (!chart || !panelEl) return;
        chart.setSize({
            width: panelEl.clientWidth,
            height: getChartHeight(),
        });
    }

    function resetZoom() {
        zoom = {};
    }

    function buildOptions(dataPoints: uPlot.AlignedData): uPlot.Options {
        if (!uPlotPaths) throw new Error("uPlot is not loaded");
        const colors = getChartColors();

        return {
            width: panelEl.clientWidth || 600,
            height: getChartHeight(),
            legend: { show: false },
            cursor: {
                x: false,
                y: false,
            },
            scales: {
                x: {
                    range: (_self, newMin, newMax) => {
                        const x = dataPoints[0] as number[];
                        if (!x.length) return [newMin, newMax] as [number, number];
                        if (newMin < x[0] || newMax > x[x.length - 1]) {
                            return [_self.scales.x.min ?? x[0], _self.scales.x.max ?? x[x.length - 1]];
                        }
                        return [newMin, newMax] as [number, number];
                    },
                },
                y: {
                    range: {
                        min: { pad: 0.2, soft: 0, mode: 1 },
                        max: { pad: 0.2, soft: 0, mode: 2 },
                    },
                },
            },
            series: [
                {},
                {
                    paths: uPlotPaths.stepped?.({ align: 1 }) ?? undefined,
                    points: { show: false, size: 1 },
                    width: 2,
                    stroke: colors.stroke,
                    fill: colors.fill,
                },
            ],
            axes: [
                {
                    show: true,
                    size: 35,
                    lineGap: 1,
                    space: 60,
                    stroke: colors.text,
                    incrs: [
                        60 * 5,
                        60 * 10,
                        60 * 15,
                        60 * 30,
                        3600,
                        3600 * 2,
                        3600 * 3,
                        3600 * 4,
                        3600 * 6,
                        3600 * 12,
                        86400,
                        86400 * 2,
                    ],
                    values: [
                        [3600, "{h}{aa}", "\n{MMM} {DD}", null, "\n{MMM} {DD}", null, null, null, 1],
                        [60, "{h}:{mm}{aa}", "\n{MMM} {DD}", null, "\n{MMM} {DD}", null, null, null, 1],
                    ],
                    grid: { show: true, stroke: colors.grid, width: 1 },
                    ticks: { show: true, stroke: colors.grid, width: 1, size: 5 },
                },
                {
                    show: true,
                    stroke: colors.text,
                    grid: { show: true, stroke: colors.grid, width: 1 },
                    ticks: { show: true, stroke: colors.grid, width: 1, size: 5 },
                },
            ],
            plugins: [tooltipPlugin(), zoomSetPlugin(), xPanPlugin()],
        };
    }

    function tooltipPlugin(): uPlot.Plugin {
        return {
            hooks: {
                init: (plot) => {
                    plot.over.addEventListener("mouseleave", () => {
                        tooltip.show = false;
                    });
                },
                setCursor: (plot) => {
                    const index = plot.cursor.idx;
                    if (index == null) {
                        tooltip.show = false;
                        return;
                    }

                    const xVal = plot.data[0][index] as number | undefined;
                    const yVal = plot.data[1][index] as number | undefined;
                    if (!xVal || !yVal) {
                        tooltip.show = false;
                        return;
                    }

                    const over = plot.over;
                    const overRect = over.getBoundingClientRect();

                    const xDateStart = DateTime.fromMillis(xVal * 1000, { zone: "utc" }).toLocal();
                    const xDateEnd = DateTime.fromMillis(xVal * 1000 + chartData.bucketMs, { zone: "utc" }).toLocal();
                    const monthName = xDateStart.toFormat("MMM");
                    const day = xDateStart.toFormat("dd");

                    tooltip.show = true;
                    tooltip.total = yVal;
                    tooltip.label = chartData.bucketMs >= 86400000
                        ? `${monthName} ${day}`
                        : `${monthName} ${day} ${dateHour(xDateStart)}-${dateHour(xDateEnd)}`;

                    let left = Math.round(plot.valToPos(xVal, "x"));
                    const tooltipWidth = 160;
                    if (left < 0) left = 0;
                    else if (left + tooltipWidth > over.clientWidth) left = over.clientWidth - tooltipWidth;

                    const vOffset = 5;
                    let top = Math.round(plot.valToPos(yVal, "y")) - 40 - vOffset;
                    if (top < 0) top = Math.round(plot.valToPos(yVal, "y")) + vOffset;

                    tooltip.left = left;
                    tooltip.top = top;
                },
            },
        };
    }

    function zoomSetPlugin(): uPlot.Plugin {
        return {
            hooks: {
                init: (plot) => {
                    plot.over.ondblclick = () => {
                        zoom = {};
                    };
                },
                setSelect: (plot) => {
                    if (plot.select.width > 0) {
                        zoom = {
                            min: plot.posToVal(plot.select.left, "x"),
                            max: plot.posToVal(plot.select.left + plot.select.width, "x"),
                        };
                    }
                },
            },
        };
    }

    function xPanPlugin(): uPlot.Plugin {
        let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

        return {
            hooks: {
                init: (plot) => {
                    const axisElems = plot.root.querySelectorAll(".u-axis");
                    if (!axisElems.length) return;

                    axisElems[0].addEventListener("mousedown", (e) => {
                        if (!zoom.min) return;

                        const x0 = (e as MouseEvent).clientX;
                        const scale = plot.scales.x;
                        const min = scale.min ?? 0;
                        const max = scale.max ?? 0;
                        const dim = plot.bbox.width;
                        const unitsPerPx = (max - min) / (dim / (UPlot?.pxRatio ?? 1));

                        const mousemove = (ev: MouseEvent) => {
                            const diff = x0 - ev.clientX;
                            const shiftBy = diff * unitsPerPx;
                            plot.setScale("x", { min: min + shiftBy, max: max + shiftBy });

                            clearTimeout(debounceTimeout!);
                            debounceTimeout = setTimeout(() => {
                                if (plot.scales.x) {
                                    zoom = {
                                        min: plot.scales.x.min!,
                                        max: plot.scales.x.max!,
                                    };
                                }
                            }, 100);
                        };

                        const mouseup = () => {
                            document.removeEventListener("mousemove", mousemove);
                            document.removeEventListener("mouseup", mouseup);
                        };

                        document.addEventListener("mousemove", mousemove);
                        document.addEventListener("mouseup", mouseup);
                    });
                },
                destroy: () => {
                    if (debounceTimeout) clearTimeout(debounceTimeout);
                },
            },
        };
    }

    function buildChartData(data: LogStat[]): ChartData {
        const timestamps: number[] = [];
        const totals: number[] = [];
        let total = 0;
        let errors = 0;
        let durationTotal = 0;
        let durationCount = 0;

        const sorted = data
            .map((s) => ({ ...s, time: parseSqliteDate(s.date).toMillis() }))
            .filter((s) => Number.isFinite(s.time))
            .sort((a, b) => a.time - b.time);

        const bucketMs = sorted.length >= 2
            ? sorted[1].time - sorted[0].time
            : 3600000;

        for (let i = 0; i < sorted.length; i++) {
            const unix = sorted[i].time / 1000;
            timestamps.push(unix);
            totals.push(sorted[i].total);

            total += sorted[i].total;
            errors += sorted[i].errors;
            if (sorted[i].avgMs != null) {
                durationTotal += sorted[i].avgMs;
                durationCount += 1;
            }

            if (sorted[i + 1]?.time) {
                const unixNext = sorted[i + 1].time / 1000;
                if (unixNext - unix > bucketMs / 1000) {
                    timestamps.push(unix + bucketMs / 1000);
                    totals.push(0);
                }
            } else if (i + 1 === sorted.length) {
                timestamps.push(unix + bucketMs / 1000);
                totals.push(0);
            }
        }

        return {
            aligned: [timestamps, totals],
            total,
            errors,
            averageMs: durationCount ? durationTotal / durationCount : null,
            bucketMs,
        };
    }

    function getChartHeight() {
        return document.body.clientWidth > 600 && document.body.clientHeight >= 720 ? 150 : 100;
    }

    function getChartColors() {
        const styles = getComputedStyle(shellEl);
        const foreground = styles.getPropertyValue("--foreground").trim() || "#27272a";
        const muted = styles.getPropertyValue("--muted-foreground").trim() || "#71717a";
        const border = styles.getPropertyValue("--border").trim() || "#e4e4e7";

        return {
            stroke: withAlpha(foreground, "0.72"),
            fill: withAlpha(foreground, "0.09"),
            text: muted,
            grid: withAlpha(border, "0.8"),
        };
    }

    function withAlpha(color: string, alpha: string) {
        if (color.startsWith("oklch(") && !color.includes("/")) {
            return color.replace(/\)$/, ` / ${alpha})`);
        }
        return color;
    }

    function dateHour(d: DateTime) {
        return d.toFormat("ha").toLowerCase();
    }

    function formatDuration(ms: number | null) {
        if (ms == null) return "-";
        if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.round(ms)}ms`;
    }
</script>

<section class="logs-chart-panel" bind:this={panelEl}>
    <div class="chart-summary">
        <div>
            <span class="summary-value">{chartData.total}</span>
            <span class="summary-label">Requests</span>
        </div>
        <div>
            <span class="summary-value">{chartData.errors}</span>
            <span class="summary-label">Errors</span>
        </div>
        <div>
            <span class="summary-value">{formatDuration(chartData.averageMs)}</span>
            <span class="summary-label">Avg time</span>
        </div>
    </div>

    <div class="chart-shell" bind:this={shellEl}>
        <div class="chart-target" bind:this={chartEl}></div>

        <div class="range-controls">
            {#each rangeOptions as option (option.key)}
                <button
                    class="range-button"
                    type="button"
                    aria-pressed={range === option.key}
                    onclick={() => { onrangechange?.(option.key); zoom = {}; }}
                >
                    {option.label}
                </button>
            {/each}
        </div>

        {#if zoomed}
            <button class="reset-zoom" onclick={resetZoom}>
                <span class="reset-zoom-primary">Reset zoom</span>
                <span class="reset-zoom-secondary">(drag the timeline to pan)</span>
            </button>
        {/if}

        {#if tooltip.show}
            <div class="chart-tooltip" style={`left: ${tooltip.left}px; top: ${tooltip.top}px;`}>
                <div class="tooltip-primary">
                    {tooltip.total} {tooltip.total === 1 ? "request" : "requests"}
                </div>
                <div class="tooltip-secondary">{tooltip.label}</div>
            </div>
        {/if}
    </div>
</section>

<style>
    .logs-chart-panel {
        display: grid;
        gap: 0.75rem;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--card);
        padding: 0.75rem 0.75rem 0.25rem;
    }

    .chart-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 0 0.25rem;
    }

    .chart-summary > div {
        min-width: 5.5rem;
    }

    .summary-value,
    .summary-label {
        display: block;
        line-height: 1.2;
    }

    .summary-value {
        font-size: 1rem;
        font-weight: 600;
        color: var(--foreground);
    }

    .summary-label {
        margin-top: 0.125rem;
        font-size: 0.75rem;
        color: var(--muted-foreground);
    }

    .chart-shell {
        position: relative;
        min-height: 110px;
        overflow: hidden;
        touch-action: none;
    }

    .chart-target {
        width: 100%;
        overflow: hidden;
    }

    .reset-zoom {
        position: absolute;
        top: 0.25rem;
        left: 50%;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
        border: 1px solid var(--border);
        border-radius: calc(var(--radius) * 0.6);
        background: var(--background);
        padding: 0.25rem 0.5rem;
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
        transition:
            color 0.15s ease,
            background 0.15s ease;
        cursor: pointer;
    }

    .reset-zoom:hover,
    .reset-zoom:focus-visible {
        background: var(--muted);
        outline: none;
    }

    .reset-zoom-primary {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--foreground);
    }

    .reset-zoom-secondary {
        font-size: 0.65rem;
        color: var(--muted-foreground);
    }

    .range-controls {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        z-index: 2;
        display: inline-flex;
        gap: 0.125rem;
        border: 1px solid var(--border);
        border-radius: calc(var(--radius) * 0.6);
        background: var(--background);
        padding: 0.125rem;
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
    }

    .range-button {
        min-width: 1.75rem;
        height: 1.5rem;
        border: none;
        border-radius: calc(var(--radius) * 0.5);
        background: transparent;
        padding: 0 0.35rem;
        font-size: 0.7rem;
        font-weight: 500;
        color: var(--muted-foreground);
        transition:
            color 0.15s ease,
            background 0.15s ease;
        cursor: pointer;
    }

    .range-button[aria-pressed="true"] {
        background: var(--muted);
        color: var(--foreground);
    }

    .range-button:hover,
    .range-button:focus-visible {
        color: var(--foreground);
        outline: none;
    }

    .chart-tooltip {
        position: absolute;
        z-index: 3;
        min-width: max-content;
        max-width: 14rem;
        border-radius: calc(var(--radius) * 0.65);
        background: var(--popover);
        color: var(--popover-foreground);
        padding: 0.45rem 0.55rem;
        text-align: center;
        font-size: 0.75rem;
        line-height: 1.2;
        pointer-events: none;
        box-shadow:
            0 10px 30px rgb(0 0 0 / 0.12),
            0 0 0 1px var(--border);
    }

    .tooltip-primary {
        font-weight: 600;
    }

    .tooltip-secondary {
        margin-top: 0.2rem;
        color: var(--muted-foreground);
    }

    :global(.logs-chart-panel .uplot) {
        font-family: inherit;
    }

    :global(.logs-chart-panel .u-cursor-x),
    :global(.logs-chart-panel .u-cursor-y),
    :global(.logs-chart-panel .u-cursor-pt) {
        display: none;
    }

    :global(.logs-chart-panel .u-select) {
        background: color-mix(in oklch, var(--foreground) 12%, transparent);
    }

    @media (max-width: 600px) {
        .logs-chart-panel {
            padding: 0.65rem 0.5rem 0.15rem;
        }

        .chart-summary {
            gap: 0.75rem;
        }
    }
</style>
