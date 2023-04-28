<script lang="ts">
    import { tooltip } from "@skeletonlabs/skeleton";
    import { Avatar } from "@skeletonlabs/skeleton";
    import { fade } from "svelte/transition";
    import { getInitials } from "$lib/utils/helperFunctions";
    import Camera from "$lib/components/HardwareDevices/Camera.svelte";
    import { afterUpdate, onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { formatDate } from "$lib/date.js";

    const relativeTime = (date: Date) => {
        const units: [number, string][] = [
            [31536000, "year"],
            [2592000, "month"],
            [86400, "day"],
            [3600, "hour"],
            [60, "minute"],
            [1, "second"],
        ];

        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        const [value, unit] = units.find(([divisor]) => seconds / divisor >= 1) || [0, "second"];

        const interval = Math.floor(seconds / value);
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    };

    export let data;
    const reports = data?.data;
    const id = data?.id;

    const mappedReports =
        reports?.map((report) => {
            return {
                ...report,
                entries: [
                    {
                        report: report.report,
                        image: report.repimg,
                        createdAt: new Date(report.repdt),
                        avatar: report.reporter?.avatar,
                        email: report.reporter?.email,
                        username: report.reporter?.username,
                    },
                    ...report.update?.map((update) => ({
                        report: update.update,
                        image: update.upimg,
                        createdAt: new Date(update.updt),
                        avatar: update.updater?.avatar,
                        email: update.updater?.email,
                        username: update.updater?.username,
                    })),
                ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
            };
        }) || [];

    let userAvatar = data?.session?.user?.user_metadata?.avatar_url;
    let userEmail = data?.session?.user?.email;

    const UpdatingReportPhases = ["Resolved", "Description", "Image"];
    type UpdatingReportType = {
        phase: string;
        newReport: string;
        newImage: Blob | null;
        cameraEnabled: boolean;
        resolved: boolean;
    };

    let openReports = [] as string[];

    let isUpdatingReport = false;
    let updatingReports = {} as Record<string, UpdatingReportType>;
    const updateReport = async (reportId: string) => {
        isUpdatingReport = true;

        const updatingReport = updatingReports[reportId];
        if (!updatingReport) return console.error("No report found in map to update");

        const reportData = new FormData();
        reportData.append("repid", reportId);
        reportData.append("report", updatingReport.newReport);
        if (updatingReport.newImage) reportData.append("image", updatingReport.newImage);
        reportData.append("resolved", updatingReport.resolved ? "true" : "false");

        await fetch("/home?/updateReport", {
            method: "POST",
            body: reportData,
        });

        delete updatingReports[reportId];
        updatingReports = { ...updatingReports };
        isUpdatingReport = false;

        goto("/home");
    };

    const gotoPreviousPhase = (reportId: string) => {
        const updatingReport = updatingReports[reportId];
        if (!updatingReport) return console.error("No report found in map to update");

        const currentPhaseIndex = UpdatingReportPhases.indexOf(updatingReport.phase);
        if (currentPhaseIndex === 0) return console.error("Cannot go back any further");

        updatingReports[reportId].phase = UpdatingReportPhases[currentPhaseIndex - 1];
    };

    const gotoNextPhase = (reportId: string) => {
        const updatingReport = updatingReports[reportId];
        if (!updatingReport) return console.error("No report found in map to update");

        const currentPhaseIndex = UpdatingReportPhases.indexOf(updatingReport.phase);
        if (currentPhaseIndex === UpdatingReportPhases.length - 1) return console.error("Cannot go forward any further");

        updatingReports[reportId].phase = UpdatingReportPhases[currentPhaseIndex + 1];
    };

    let updateCounter = 0;
    afterUpdate(() => {
        if (!id || !data || updateCounter >= 2) return;
        updateCounter++;

        if (updateCounter === 1) {
            openReports = [id];
            if ((reports?.find((report) => report.repid === id)?.update?.length || 0) <= 2) {
                updatingReports = {
                    ...updatingReports,
                    [id]: {
                        phase: "Resolved",
                        newReport: "",
                        newImage: null,
                        cameraEnabled: false,
                        resolved: false,
                    },
                };
            }
            return;
        }

        const element = document.getElementById(id);
        const scrollbox = document.getElementById("scrollbox");
        if (element && scrollbox) {
            const offsetTop = element.getBoundingClientRect().top;
            const scrollboxHeight = scrollbox.getBoundingClientRect().height;
            scrollbox.scrollTo({ top: offsetTop + scrollboxHeight / 2, behavior: "smooth" });
        }
        console.log(element);
    });
</script>

<section>
    <article>
        <h4 class="p-3 text-medium">Here are the latest reports:</h4>
        {#if !reports}
            <p class="text-lg font-medium">Error loading reports</p>
        {:else if reports.length === 0}
            <p class="text-lg font-medium">No reports available</p>
        {:else}
            <ul>
                {#each mappedReports as report}
                    <li class="m-4" id={report.repid}>
                        <button
                            class="flex gap-4 items-center w-full"
                            on:click={() => {
                                const hasReport = openReports.includes(report.repid);

                                if (hasReport) openReports = openReports.filter((id) => id !== report.repid);
                                else openReports = [...openReports, report.repid];
                            }}
                        >
                            <img
                                src={report.entries.at(0)?.image || "/images/placeholder.jpg"}
                                alt={report.subcat}
                                class="h-12 w-12 object-cover shadow-md rounded-full"
                            />

                            <summary class="w-full">
                                <div class="flex justify-between">
                                    <span class="text-base font-medium sm:text-lg">{report.subcat}</span>
                                    <svg viewBox="0 0 256 256" class={`w-6 h-6 ${openReports.includes(report.repid) ? "rotate-180" : ""}`}
                                        ><path
                                            d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
                                        /></svg
                                    >
                                </div>

                                <hr />
                                <div class="flex justify-between">
                                    <div class="text-sm sm:text-md text-left">
                                        Reported in
                                        {#if report.addressData?.features[0].properties.words}
                                            <span class="text-red-500">///</span>
                                            {JSON.parse(report.reppoint || "")}
                                        {:else}
                                            {report?.addressData?.features[0]?.properties?.display_name.split(",").slice(1, 3).join(", ")}
                                        {/if}
                                    </div>
                                    <p class="hidden sm:block text-sm font-light unstyled">
                                        {relativeTime(new Date(report.repdt))}
                                    </p>
                                </div>
                            </summary>
                        </button>

                        {#if openReports.includes(report.repid)}
                            <div
                                class="rounded-md shadow-md my-4 lg:grid grid-cols-3 bg-gray-200 border border-gray-300"
                                in:fade={{ duration: 100 }}
                                out:fade={{ duration: 100 }}
                            >
                                <div class="relative w-full lg:h-full">
                                    <img
                                        src={report.entries.at(0)?.image || "/images/placeholder.jpg"}
                                        alt={report.subcat}
                                        class="lg:absolute lg:inset-0 h-full w-full object-cover lg:border-r-2 border-gray-300 border-b-2 lg:border-b-0 max-h-[20rem] lg:rounded-l-md rounded-t-md"
                                    />
                                </div>

                                <div class="p-2 space-y-2 sm:p-4 sm:space-y-4 w-full col-span-2">
                                    <h3 class="font-medium sm:text-xl">
                                        {report.subcat}
                                    </h3>
                                    <h6 class="font-light sm:text-md sm:font-normal">
                                        {report?.addressData?.features[0]?.properties?.display_name.split(",").slice(1, 3).join(", ")}
                                    </h6>
                                    <article>
                                        <p class="unstyled font-normal mt-2 text-base sm:text-md sm:font-medium">
                                            {report.entries.at(0)?.report}
                                        </p>
                                    </article>
                                    <footer class="flex justify-start items-center space-x-4">
                                        <figure
                                            class="hidden avatar sm:flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate bg-surface-400-500-token w-12 rounded-full"
                                            data-testid="avatar"
                                        >
                                            {#if report.entries.at(0)?.avatar}
                                                <Avatar src={report.entries.at(0)?.avatar} />
                                            {:else}
                                                <Avatar initials={getInitials(report.entries.at(0)?.email || "")} />
                                            {/if}
                                        </figure>
                                        <div class="flex-auto flex justify-between items-center flex-wrap sm:flex-col sm:items-start">
                                            <h6 class="sm:text-md sm:font-bold sm:text-base">
                                                by {report.entries.at(0)?.username || "Anonymous"}
                                            </h6>
                                            <p class="unstyled text-sm font-light pt-2">
                                                {relativeTime(new Date(report.repdt))}
                                            </p>
                                        </div>
                                        <span class="divider-vertical h-20" />
                                        <div class="flex gap-2 flex-wrap flex-row-reverse relative">
                                            <a
                                                data-sveltekit-reload
                                                href={`/map?lat=${report.replaty}&lng=${report.replonx}&id=${report.repid}`}
                                                class="secondary-button">View in Map</a
                                            >
                                        </div>
                                    </footer>
                                </div>
                                {#if report.entries.length > 1}
                                    <div class="col-span-3 px-4 space-y-3 pb-4">
                                        <h4 class="font-medium sm:text-xl">History</h4>
                                        {#each report.entries.slice(1) as entry, i}
                                            <p class={``}>
                                                {report.entries.length - 2 === i ? "Original Report" : `Update ${report.entries.length - i - 2}`} on {formatDate(
                                                    entry.createdAt
                                                )}: <span class="font-bold">{entry.report}</span>
                                            </p>
                                        {/each}
                                    </div>
                                {/if}
                                {#if updatingReports[report.repid]}
                                    <div class="col-span-3 p-4 space-y-4">
                                        {#if updatingReports[report.repid].phase === "Description"}
                                            <textarea
                                                name="description"
                                                bind:value={updatingReports[report.repid].newReport}
                                                id="report"
                                                cols="30"
                                                required
                                                rows="5"
                                                class="p-2 rounded-lg drop-shadow-sm border border-gray-300 z-10"
                                                placeholder="Write your incident report here..."
                                                minlength="7"
                                            />
                                            <button class="secondary-button" on:click={() => gotoPreviousPhase(report.repid)}>Back</button>
                                            {#if updatingReports[report.repid].newReport.length < 7}
                                                <button
                                                    class="primary-button"
                                                    use:tooltip={{
                                                        content: "Minimum characters required is 7.",
                                                        position: "bottom",
                                                    }}>Next</button
                                                >
                                            {:else}
                                                <button class="primary-button" on:click={() => gotoNextPhase(report.repid)}>Next</button>
                                            {/if}
                                        {:else if updatingReports[report.repid].phase === "Image"}
                                            <h3 class="text-center">Do you want to take a photo?</h3>
                                            {#if updatingReports[report.repid].cameraEnabled}<Camera
                                                    onCapture={(blob) => (updatingReports[report.repid].newImage = blob)}
                                                />{/if}
                                            <div class="flex gap-4 justify-center">
                                                <button
                                                    class="secondary-button"
                                                    on:click={() =>
                                                        !updatingReports[report.repid].cameraEnabled
                                                            ? updateReport(report.repid)
                                                            : gotoPreviousPhase(report.repid)}
                                                    use:tooltip={{
                                                        content: "We recommend you take a photo of the incident",
                                                        position: "top",
                                                    }}
                                                >
                                                    {!updatingReports[report.repid].cameraEnabled ? "No" : "Skip"}
                                                </button>
                                                <button
                                                    class="primary-button"
                                                    disabled={updatingReports[report.repid].cameraEnabled && !updatingReports[report.repid].newImage}
                                                    on:click={() =>
                                                        updatingReports[report.repid].cameraEnabled
                                                            ? updateReport(report.repid)
                                                            : (updatingReports[report.repid].cameraEnabled = true)}
                                                >
                                                    {updatingReports[report.repid].cameraEnabled ? "Continue" : "Yes"}
                                                </button>
                                            </div>
                                        {:else if updatingReports[report.repid].phase === "Resolved"}
                                            <h3 class="text-center">Is the issue resolved?</h3>
                                            <div class="flex gap-4 justify-center">
                                                <button
                                                    class="secondary-button"
                                                    disabled={isUpdatingReport}
                                                    on:click={() => {
                                                        gotoNextPhase(report.repid);
                                                        updatingReports[report.repid].resolved = false;
                                                    }}>No</button
                                                >
                                                <button
                                                    class="primary-button"
                                                    disabled={isUpdatingReport}
                                                    on:click={() => {
                                                        gotoNextPhase(report.repid);
                                                        updatingReports[report.repid].resolved = true;
                                                    }}>Yes</button
                                                >
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </article>
</section>
