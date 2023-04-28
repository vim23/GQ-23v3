<script lang="ts">
    import Camera from "$lib/components/HardwareDevices/Camera.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { Avatar, tooltip } from "@skeletonlabs/skeleton";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import { getInitials, getW3wordsDetails } from "$lib/utils/helperFunctions";
    import What3wordsmap from "$lib/components/HardwareDevices/What3wordsmap.svelte";
    import { supabaseClient } from "$lib/db.js";
    import { onMount } from "svelte";

    export let data;

    let sameLocationModalOpen = false;

    let closestIncident: { replaty: any; replonx: any; repid: any };
    const handlewhat3words = async (e: { detail: { text: string } }) => {
        const locationDetails = await getW3wordsDetails(e.detail.text);
        if (!locationDetails) return console.error("No location details found");

        const { lat, lng } = locationDetails.what3words.coordinates;
        if (!lng || !lat) return console.error("No coordinates found");

        if (!reportDetails.category || !reportDetails.subCategory) return console.error("No category or subcategory found");

        const subcategory = reportCategories[reportDetails.category]?.children[reportDetails.subCategory];
        if (!subcategory) return console.error("No subcategory found");

        const reportsForm = new FormData();
        reportsForm.append("lng", lat.toString());
        reportsForm.append("lat", lng.toString());
        reportsForm.append("distance", "0.000225");
        reportsForm.append("name", subcategory);

        const reportsInView = JSON.parse(
            (
                await (
                    await fetch(`?/reportsInView`, {
                        method: "POST",
                        body: reportsForm,
                    })
                ).json()
            ).data
        );

        if (reportsInView.at(0)?.length) sameLocationModalOpen = true;
        const point = reportsInView.at(4);
        if (point) {
            const [lat, lng] = point.replace("POINT(", "").replace(")", "").split(" ");
            closestIncident = {
                replaty: lat,
                replonx: lng,
                repid: reportsInView.at(2),
            };
        }

        reportDetails.location = {
            identifier: locationDetails.what3words.words,
            street: locationDetails.address.features.at(0)?.properties.name || "",
            suburb: locationDetails.address.features.at(0)?.properties.address.suburb || "",
            lat,
            lng,
        };
    };

    let username = data?.session?.user?.user_metadata?.name || data?.session?.user?.user_metadata?.username;
    let userAvatar = data?.session?.user?.user_metadata?.avatar_url;
    let userEmail = data?.session?.user?.email;

    let loading = false;
    const getProfile = async () => {
        try {
            loading = true;
            const userId = data?.session?.user.id;
            const { data: userData, error, status } = await supabaseClient.from("user").select(`username, avatar, email`).eq("id", userId).single();

            if (data) {
                username = userData?.username;
                userAvatar = userData?.avatar;
                if (userData?.email) userEmail = userData.email;
            }

            if (error && status !== 406) throw error;
        } catch (error) {
            if (error instanceof Error) {
                console.log("error is:", error);
                return error.message;
            }
        } finally {
            loading = false;
        }
    };

    let submittingReport = false;
    const reportPhases = ["Intro", "Report Type", "Category", "Sub Category", "Description", "Location Intro", "Location", "Camera", "Summary"] as const;
    let reportPhase = reportPhases[0] as (typeof reportPhases)[number];

    type SingleNestedCategories = Record<string, { name: string; children: Record<string, string> }>;
    const reportCategories: SingleNestedCategories = {
        water_and_sewerage: {
            name: "Water & Sewerage",
            children: {
                WL: "Water Leak",
                WS: "Sewage Leak",
                WP: "Water Point",
                AD: "Drainage",
            },
        },
        broken_asset: {
            name: "Broken Asset",
            children: {
                AP: "Pothole",
                AS: "Street Light",
                AB: "Bridge Railing",
                AR: "Road Sign",
                AM: "Manhole Cover",
            },
        },
        safety_and_security: {
            name: "Safety & Security",
            children: {
                ST: "Traffic Hazard",
                SF: "Fire Hazard",
                SC: "Crime",
                SA: "Animal Abuse",
            },
        },
        health_and_environment: {
            name: "Health & Environment",
            children: {
                HW: "Waste Dumping",
                HR: "Rough Sleeping",
                HV: "Alien Vegetation",
            },
        },
        something_else: {
            name: "Something Else",
            children: {
                OC: "Complaint",
                OS: "Suggestion",
            },
        },
    };

    let cameraEnabled = false;
    let reportType = "";
    let reportDetails = {
        category: null as string | null,
        subCategory: null as string | null,
        description: "",
        location: {
            identifier: "",
            street: "",
            suburb: "",
            lat: null as number | null,
            lng: null as number | null,
        },
        image: null as Blob | null,
    };

    const gotoNextPhase = () => {
        const index = reportPhases.indexOf(reportPhase);
        reportPhase = reportPhases[index + 1] || reportPhases[reportPhases.length - 1];
    };

    const gotoPreviousPhase = () => {
        const index = reportPhases.indexOf(reportPhase);
        reportPhase = reportPhases[index - 1] || reportPhases[0];

        // Remove all data upwards of the phase
        let removalIndex = Object.keys(reportDetails).length;
        if (["Intro", "Report Type"].includes(reportPhase)) removalIndex = 0;
        else if ("Category" === reportPhase) removalIndex = 1;
        else if ("Sub Category" === reportPhase) removalIndex = 2;
        else if (["Description", "Location Intro"].includes(reportPhase)) removalIndex = 3;
        else if ("Location" === reportPhase) removalIndex = 4;

        reportDetails = {
            category: removalIndex > 0 ? reportDetails.category : null,
            subCategory: removalIndex > 1 ? reportDetails.subCategory : null,
            description: removalIndex > 2 ? reportDetails.description : "",
            location:
                removalIndex > 3
                    ? reportDetails.location
                    : {
                          identifier: "",
                          street: "",
                          suburb: "",
                          lat: null,
                          lng: null,
                      },
            image: removalIndex > 4 ? reportDetails.image : null,
        };
    };

    const submitReviewedFormData = async () => {
        const reportData = new FormData();

        if (!reportDetails.category) return console.error("Missing category, please select a category for your report");
        reportData.append("category", reportCategories[reportDetails.category].name);
        reportData.append("catcode", reportDetails.category);

        if (!reportDetails.subCategory) return console.error("Missing sub category, please select a sub category for your report");
        reportData.append("subcat", reportCategories[reportDetails.category].children[reportDetails.subCategory]);
        reportData.append("subcatcode", reportDetails.subCategory);

        reportData.append("report", reportDetails.description);
        reportData.append("user", JSON.stringify($page.data.user));
        reportData.append("status", "Active");

        // Location point details
        if (!reportDetails.location.lat || !reportDetails.location.lng) return console.error("Missing location, please select a location for your report");
        const locationDetails = { lat: reportDetails.location.lat, lng: reportDetails.location.lng };
        reportData.append("location", JSON.stringify(locationDetails));
        reportData.append("replaty", locationDetails.lat.toString());
        reportData.append("replonx", locationDetails.lng.toString());
        reportData.append("what3words", reportDetails.location.identifier);

        // Image details
        if (reportDetails.image) reportData.append("image", reportDetails.image);

        console.log("report data", reportData);

        submittingReport = true;
        console.log("about to send the report to supabase!");
        await fetch("?/addReport", {
            method: "POST",
            body: reportData,
        });

        const homeElement = document.getElementById("home");
        if (homeElement) homeElement.click();
        else goto("home");
    };

    onMount(() => getProfile());
</script>

{#if submittingReport}
    <div class="flex flex-col justify-center min-h-screen items-center">
        <SpinnerLoader />
        <h2 class="mt-4">Sending report...</h2>
    </div>
{:else if !submittingReport}
    <a id="home" href="/map" class="hidden" data-sveltekit-reload>HOME</a>
    <main class="px-6 py-6 space-y-4">
        {#if reportPhase === "Intro"}
            <h3>Submitting a Report</h3>
            <p>
                Get the Picture Surveys equips every citizen with the power to play an active role in taking care of our city. If there is a water leak,
                pothole, broken light or any other problem that poses a risk, simply type in your report, take a photo, give the location and submit your report
                to us. To get started, please click the next button.
            </p>
            <button class="primary-button mx-2" on:click={gotoNextPhase}>Next</button>
        {/if}
        {#if reportPhase === "Report Type"}
            <h3>Are you making a new report or updating an existing report?</h3>
            <fieldset class="space-y-2">
                <div class="flex items-center gap-4">
                    <input type="radio" value={"new"} name={"Category"} id={"new"} bind:group={reportType} />
                    <label for={"new"}>New Report</label>
                </div>
                <div class="flex items-center gap-4">
                    <input type="radio" value={"update"} name={"Category"} id={"update"} bind:group={reportType} />
                    <label for={"update"}>Update existing report</label>
                </div>
            </fieldset>
            <button class="secondary-button" on:click={gotoPreviousPhase}>Back</button>
            {#if reportType === "new" || !reportType}
                <button class="primary-button mx-2" disabled={!reportType} on:click={gotoNextPhase}>Next</button>
            {:else if reportType === "update"}
                <a type="button" href="/map" data-sveltekit-reload class="primary-button mx-2">Next</a>
            {/if}
        {/if}
        {#if reportPhase === "Category"}
            <h3>What are you reporting?</h3>
            <fieldset class="space-y-2">
                {#each Object.entries(reportCategories).map(([key, value]) => ({ code: key, name: value.name })) as category}
                    <div class="flex items-center gap-4">
                        <input type="radio" value={category.code} name={"Category"} id={category.code} bind:group={reportDetails.category} />
                        <label for={category.code}>{category.name}</label>
                    </div>
                {/each}
            </fieldset>
            <button class="secondary-button" on:click={gotoPreviousPhase}>Back</button>
            <button class="primary-button mx-2" disabled={!reportDetails.category} on:click={gotoNextPhase}>Next</button>
        {/if}
        {#if reportPhase === "Sub Category"}
            <h3>Please select a sub category</h3>
            <fieldset class="space-y-2">
                {#if reportDetails.category}
                    {#each Object.entries(reportCategories[reportDetails.category].children).map(([key, value]) => ({ code: key, name: value })) as subCategory}
                        <div class="flex items-center gap-4">
                            <input type="radio" value={subCategory.code} name={"Sub Category"} id={subCategory.code} bind:group={reportDetails.subCategory} />
                            <label for={subCategory.code}>{subCategory.name}</label>
                        </div>
                    {/each}
                {/if}
            </fieldset>
            <button class="secondary-button" on:click={gotoPreviousPhase}>Back</button>
            <button class="primary-button mx-2" disabled={!reportDetails.subCategory} on:click={gotoNextPhase}>Next</button>
        {/if}
        {#if reportPhase === "Description"}
            <textarea
                name="description"
                bind:value={reportDetails.description}
                id="report"
                cols="30"
                required
                rows="5"
                class="p-2 rounded-lg drop-shadow-sm border border-gray-300 z-10"
                placeholder="Write your incident report here..."
                minlength="7"
            />
            <button class="secondary-button" on:click={gotoPreviousPhase}>Back</button>
            {#if reportDetails.description.length < 7}
                <button
                    class="primary-button mx-2 opacity-50"
                    use:tooltip={{
                        content: "Minimum characters required is 7.",
                        position: "bottom",
                    }}>Next</button
                >
            {:else}
                <button class="primary-button mx-2" on:click={gotoNextPhase}>Next</button>
            {/if}
        {/if}
        {#if reportPhase === "Location Intro"}
            <p>To select the location of the incident, please click the select location button below.</p>
            <p>We're using what3words which offers super accurate location information.</p>
            <div class="flex gap-3 mt-3">
                <button class="secondary-button" on:click={gotoPreviousPhase}>Back</button>
                <button class="primary-button mx-2" on:click={gotoNextPhase}>Send Location</button>
            </div>
        {/if}
        {#if reportPhase === "Location"}
            <div class="flex flex-col map-what3words-containter">
                <div class="map-container flex flex-col h-full">
                    <p class="mb-2 sm:my-4 text-sm">Please click on the map to select the location.</p>
                    <div class="h-full w-full">
                        {#if window}
                            <What3wordsmap on:what3words={handlewhat3words} />
                        {/if}
                    </div>
                </div>
                {#if reportDetails.location}
                    <h3 class="text-center text-slate-600">Selected location:</h3>
                    <span class="text-lg font-medium text-slate-800 text-center mt-2"
                        ><span class="text-red-500">///</span>{reportDetails.location.identifier}</span
                    >
                {/if}
                <div class="flex gap-3 mt-3 justify-center">
                    <button class="secondary-button" on:click={gotoPreviousPhase}>Back</button>
                    <button class="primary-button mx-2" disabled={!reportDetails.location} on:click={gotoNextPhase}>Next</button>
                </div>
            </div>
        {/if}
        <!-- Take a photo -->
        {#if reportPhase === "Camera"}
            <h3 class="text-center">Do you want to take a photo?</h3>
            {#if cameraEnabled}<Camera onCapture={(blob) => (reportDetails.image = blob)} />{/if}
            <div class="flex gap-4 justify-center">
                <button
                    class="secondary-button"
                    on:click={() => (!cameraEnabled ? gotoNextPhase() : gotoPreviousPhase())}
                    use:tooltip={{
                        content: "We recommend you take a photo of the incident",
                        position: "top",
                    }}
                >
                    {!cameraEnabled ? "No" : "Skip"}
                </button>
                <button
                    class="primary-button mx-2"
                    disabled={cameraEnabled && !reportDetails.image}
                    on:click={() => (cameraEnabled ? gotoNextPhase() : (cameraEnabled = true))}
                >
                    {cameraEnabled ? "Continue" : "Yes"}
                </button>
            </div>
        {/if}
        {#if reportPhase === "Summary"}
            <div class="card space-y-4 p-4">
                {#if reportDetails.image}
                    <img
                        src={URL.createObjectURL(reportDetails.image)}
                        alt={"Reported incident"}
                        class={"bg-black/50 w-[320px] h-[240px] rounded-md object-cover mx-auto"}
                    />
                {/if}

                <h6 class="text-primary-500">Review your report</h6>
                {#if reportDetails.category && reportDetails.subCategory}
                    <h3>{reportCategories[reportDetails.category].name} - {reportCategories[reportDetails.category].children[reportDetails.subCategory]}</h3>
                {/if}
                <p><span class="text-red-500">///</span>{reportDetails.location.identifier}</p>
                <p>{reportDetails.location.street}, {reportDetails.location.suburb}</p>
                <p>{reportDetails.description}</p>

                <hr />
                <footer class="p-4 flex justify-start items-center space-x-4">
                    <figure
                        class="avatar flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate bg-surface-400-500-token w-12 rounded-full"
                        data-testid="avatar"
                    >
                        {#if userAvatar}
                            <Avatar src={userAvatar} />
                        {:else}
                            <Avatar initials={getInitials(userEmail || "")} />
                        {/if}
                    </figure>
                    <div class="flex-auto flex justify-between items-center flex-wrap">
                        <h6 class="font-bold">by {username}</h6>
                    </div>
                    <div class="flex gap-4 flex-wrap flex-row-reverse">
                        <button
                            class="secondary-button"
                            on:click={() => {
                                reportPhase = "Category";
                            }}>Edit report</button
                        >
                        <button class="primary-button mx-2" on:click={submitReviewedFormData}>Submit report</button>
                    </div>
                </footer>
            </div>
        {/if}
    </main>
{/if}

<div class={`${sameLocationModalOpen ? "fixed" : "hidden"} bg-black/30 inset-0 flex items-center justify-center z-[1000]`}>
    <div class="bg-white rounded-md shadow border py-4 px-6 m-8">
        <div class="flex flex-col gap-2">
            <h3>Incident already reported</h3>
            <p class="text-sm text-gray-700">
                A report has already been submitted for a {reportCategories[reportDetails.category || ""]?.children[reportDetails.subCategory || ""] ||
                    "Unknown"} incident within 25 metres of your selected location.
            </p>
            <p class="text-sm text-gray-700">Please update the existing report in the map.</p>
        </div>
        <div class="flex justify-end gap-4">
            <a class="secondary-button" data-sveltekit-reload href="/map"> Go back </a>
            <a
                class="primary-button mx-2"
                data-sveltekit-reload
                href={`/map?lat=${closestIncident?.replaty}&lng=${closestIncident?.replonx}&id=${closestIncident?.repid}`}
            >
                Find on map
            </a>
        </div>
    </div>
</div>
