<script lang="ts">
    import { goto } from "$app/navigation";
    import Camera from "$lib/components/HardwareDevices/Camera.svelte";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import { getInitials, relativeTime } from "$lib/utils/helperFunctions";
    import { AccordionGroup, AccordionItem, Avatar } from "@skeletonlabs/skeleton";
    import { fade, fly } from "svelte/transition";

    export let data;
    const user = data.session?.user.user_metadata.username;
    const report2Update = data?.data;
    console.log("data array", data.data?.update);
    let loading = false;
    let submittingReport = false;
    let isDisabled = false;

    let { catcode, category, repid, repimg, report, reporter, replaty, repdt, reploc, replonx, reporter_avatar, reppoint, subcat, addressData } =
        report2Update!;

    let what3wordsLogo = "///";

    let userAvatar = data?.session?.user?.user_metadata?.avatar_url;
    let userEmail = data?.session?.user?.email;

    let avatarIsAvailable = false;
    if (userAvatar) {
        avatarIsAvailable = true;
    }

    let disableUpdateReportBtn = true;
    let updatingReport: string = "";

    type UpdatingReportType = {
        newReport: string;
        newImage: File;
        resolved: boolean;
    };

    const updatingReports = {} as Record<string, UpdatingReportType>;

    const updateReport = async (reportId: string) => {
        submittingReport = true;

        const updatingReport = updatingReports[reportId];
        const reportData = new FormData();
        reportData.append("repid", reportId);
        reportData.append("report", updatingReport.newReport);
        reportData.append("image", updatingReport.newImage);
        reportData.append("resolved", updatingReport.resolved ? "true" : "false");

        await fetch("/addReport?/updateReport", {
            method: "POST",
            body: reportData,
        });

        await goto("/home");
    };
</script>

{#if submittingReport}
    <div class="flex flex-col justify-center min-h-screen items-center">
        <SpinnerLoader />
        <h2>Updating report</h2>
    </div>
{:else if !submittingReport}
    <AccordionGroup>
        {#if report2Update?.update?.length > 0}
            <AccordionItem open>
                <svelte:fragment slot="summary">
                    <br />
                    <div class="flex justify-between">
                        <div>
                            Reported in
                            {#if addressData.features[0].properties.words}
                                <span class="text-red-500">{what3wordsLogo}</span>
                                {JSON.parse(report.reppoint)}
                            {:else}
                                {addressData?.features[0]?.properties?.address?.road
                                    ? addressData?.features[0]?.properties?.address?.road
                                    : addressData?.features[0]?.properties?.address?.suburb},
                                {addressData?.features[0]?.properties?.address?.neighbourhood
                                    ? addressData?.features[0]?.properties?.address?.neighbourhood
                                    : addressData?.features[0]?.properties?.address?.county}
                            {/if}
                        </div>
                        <p class="unstyled text-sm font-light">{relativeTime(repdt)}</p>
                    </div></svelte:fragment
                >svelte:fragment >
                <svelte:fragment slot="lead"><Avatar src={repimg} /></svelte:fragment>
                <svelte:fragment slot="content"
                    ><div
                        class="card max-w-xl mx-auto md:col-span-2 overflow-hidden drop-shadow-md"
                        in:fly={{ x: -50, duration: 300, delay: 300 }}
                        out:fade={{ duration: 300 }}
                    >
                        <header>
                            <img src={repimg} alt={subcat} class="bg-black/50 w-full object-cover h-full shadow-md" />
                        </header>
                        <div class="p-4 space-y-4">
                            <p>Initial report</p>
                            <h3 class="font-bold">
                                {subcat}
                            </h3>
                            <h6>
                                <span class="text-red-500">/// </span>{!addressData?.features[0]?.properties?.words
                                    ? addressData?.features[0]?.properties?.display_name
                                    : addressData?.features[0]?.properties?.words}
                            </h6>

                            <p class="text-gray-500 font-semibold">{report}</p>

                            <footer class="flex justify-start items-center space-x-4">
                                <div class="flex-auto flex justify-between items-center gap-4 flex-wrap">
                                    <h6 class="font-bold">First report by {reporter}</h6>
                                    <p class="unstyled text-sm font-light">
                                        {relativeTime(repdt)}
                                    </p>
                                </div>
                            </footer>
                            <hr />
                            <!-- updated report below -->
                        </div>
                        {#each report2Update?.update as { resolved, update, updater, updt, upimg, upid, uprepid }}
                            <header>
                                <img src={upimg} alt={subcat} class="bg-black/50 w-full object-cover h-full shadow-md" />
                            </header>
                            <div class="p-4 space-y-4">
                                <p>Updated report</p>
                                <h3 class="font-bold">
                                    {subcat}
                                </h3>
                                <h6>
                                    <span class="text-red-500">/// </span>{!addressData?.features[0]?.properties?.words
                                        ? addressData?.features[0]?.properties?.display_name
                                        : addressData?.features[0]?.properties?.words}
                                </h6>

                                <p class="text-gray-500 font-semibold">{update}</p>

                                <footer class="flex justify-start items-center space-x-4">
                                    <div class="flex-auto flex justify-between items-center gap-4 flex-wrap">
                                        <h6 class="font-bold">Updated by {updater}</h6>
                                        <p class="unstyled text-sm font-light">
                                            {relativeTime(updt)}
                                        </p>
                                    </div>
                                </footer>
                            </div>
                            <hr />
                        {/each}
                        <!-- updated report below -->
                        <div class="p-4 space-y-4">
                            {#if report2Update.update.length <= 5}
                                <article>
                                    <form on:submit|preventDefault={updateReport}>
                                        <textarea class="mt-4" placeholder="Please update the report here" bind:value={updatingReport} />
                                        {#if !disableUpdateReportBtn}
                                            <div class="flex mt-4 justify-center" transition:fade>
                                                <Camera onCapture={(blob) => (updatedForm.blob = blob.toString())} />
                                            </div>
                                        {/if}
                                        <div class="flex justify-center" transition:fade>
                                            <div hidden={!updatedForm.blob[0]} transition:fade>
                                                <button
                                                    type="submit"
                                                    class="primary-button"
                                                    disabled={isDisabled}
                                                    on:click={() => {
                                                        isDisabled = true;
                                                    }}>Send report</button
                                                >
                                            </div>
                                        </div>
                                    </form>
                                </article>
                            {/if}
                            <hr />
                        </div>
                        <footer class="p-4 flex justify-start items-center space-x-4">
                            <figure
                                class="avatar flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate bg-surface-400-500-token w-12 rounded-full undefined undefined"
                                data-testid="avatar"
                            >
                                {#if avatarIsAvailable}
                                    <Avatar src={userAvatar} />
                                {:else}
                                    <Avatar initials={getInitials(userEmail)} />
                                {/if}
                            </figure>
                            <div class="flex-auto flex justify-between items-center gap-4 flex-wrap">
                                <h6 class="font-bold">{user}</h6>
                            </div>
                        </footer>
                    </div>
                </svelte:fragment>
            </AccordionItem>
        {:else if !report2Update.update.length}
            <AccordionItem open>
                <svelte:fragment slot="summary">
                    <div>
                        <span class="text-lg font-medium">{subcat}</span>
                        <br />Reported in
                        {#if addressData.features[0].properties.words}
                            <span class="text-red-500">{what3wordsLogo} </span>
                            {JSON.parse(reppoint)}
                        {:else}
                            {addressData?.features[0]?.properties?.address?.road
                                ? addressData?.features[0]?.properties?.address?.road
                                : addressData?.features[0]?.properties?.address?.suburb},
                            {addressData?.features[0]?.properties?.address?.neighbourhood
                                ? addressData?.features[0]?.properties?.address?.neighbourhood
                                : addressData?.features[0]?.properties?.address?.county}
                        {/if}
                    </div></svelte:fragment
                >svelte:fragment >
                <svelte:fragment slot="lead"><Avatar src={repimg} /></svelte:fragment>
                <svelte:fragment slot="content"
                    ><div
                        class="card max-w-xl mx-auto md:col-span-2 overflow-hidden drop-shadow-md"
                        in:fly={{ x: -50, duration: 300, delay: 300 }}
                        out:fade={{ duration: 300 }}
                    >
                        <header>
                            <img src={repimg} alt={subcat} class="bg-black/50 w-full object-cover h-full shadow-md" />
                        </header>
                        <div class="p-4 space-y-4">
                            <h3 class="font-bold">
                                {subcat}
                            </h3>
                            <h6>
                                <span class="text-red-500">/// </span>{!addressData?.features[0]?.properties?.words
                                    ? addressData?.features[0]?.properties?.display_name
                                    : addressData?.features[0]?.properties?.words}
                            </h6>

                            <p class="text-gray-500 font-semibold">{report}</p>

                            <footer class="flex justify-start items-center space-x-4">
                                <div class="flex-auto flex justify-between items-center gap-4 flex-wrap">
                                    <h6 class="font-bold">Report by {reporter}</h6>
                                    <p class="unstyled text-sm font-light">
                                        {relativeTime(repdt)}
                                    </p>
                                </div>
                            </footer>
                            <hr />
                            <!-- updated report below -->
                            {#if report2Update.update.length <= 5}
                                <article>
                                    <form on:submit|preventDefault={updateReport}>
                                        <textarea class="mt-4" placeholder="Please update the report here" bind:value={updatingReport} />
                                        {#if !disableUpdateReportBtn}
                                            <div class="flex mt-4 justify-center" transition:fade>
                                                <Camera onCapture={(blob) => (updatedForm.blob = blob.toString())} />
                                            </div>
                                        {/if}
                                        <div class="flex justify-center" transition:fade>
                                            <div hidden={!updatedForm.blob[0]} transition:fade>
                                                <button
                                                    type="submit"
                                                    class="primary-button"
                                                    disabled={isDisabled}
                                                    on:click={() => {
                                                        isDisabled = true;
                                                    }}>Send report</button
                                                >
                                            </div>
                                        </div>
                                    </form>
                                </article>
                            {/if}
                        </div>
                        <hr />
                        <footer class="p-4 flex justify-start items-center space-x-4">
                            <figure
                                class="avatar flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate bg-surface-400-500-token w-12 rounded-full undefined undefined"
                                data-testid="avatar"
                            >
                                {#if avatarIsAvailable}
                                    <Avatar src={userAvatar} />
                                {:else}
                                    <Avatar initials={getInitials(userEmail)} />
                                {/if}
                            </figure>
                            <div class="flex-auto flex justify-between items-center gap-4 flex-wrap">
                                <h6 class="font-bold">{user}</h6>
                            </div>
                        </footer>
                    </div>
                </svelte:fragment>
            </AccordionItem>
        {/if}
    </AccordionGroup>
{/if}
