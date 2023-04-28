<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import "leaflet/dist/leaflet.css";
    import { beforeNavigate } from "$app/navigation";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import "leaflet/dist/images/marker-shadow.png";
    import { toastStore } from "@skeletonlabs/skeleton";

    const dispatch = createEventDispatcher();

    let loading = false;
    let trackedMap: L.Map;
    let marker: L.Marker;
    let modalOpen = true;

    // Zoom controls
    const zoomIn = () => trackedMap.zoomIn();
    const zoomOut = () => trackedMap.zoomOut();

    // Zoom to extents
    const zoomToExtends = () => {
        trackedMap.setView([-33.86605, 25.60749], 9);
    };

    // Zoom to user location
    const onLocationFound: L.LocationEventHandlerFn = async (e) => {
        const L = await import("leaflet");
        const radius = e.accuracy / 4;
        const circle = L.circle(e.latlng, radius).addTo(trackedMap);
        const popup = circle.bindPopup("Your approximate location").openPopup();
        setTimeout(() => {
            popup.remove();
            circle.remove();
        }, 3000);
    };

    const zoomToUserLocation = () => {
        trackedMap.locate({
            setView: true,
            maxZoom: 16,
            enableHighAccuracy: true,
        });
        trackedMap.on("locationfound", onLocationFound);
    };

    // Initialize the map
    const initMap = async () => {
        loading = true;

        const { layers, map, generateMarker, drawGrid, getW3W } = await import("../map");

        trackedMap = map;

        layers.addTo(trackedMap);

        trackedMap.whenReady(() => drawGrid(trackedMap));
        trackedMap.on("moveend", () => drawGrid(trackedMap));
        trackedMap.on("zoom", () => drawGrid(trackedMap));

        const toastMessage = {
            message: "Thank you. Location successfully logged. You may proceed to the next step.",
            autohide: true,
            timeout: 5000,
        };

        const addMarker: L.LeafletMouseEventHandlerFn = async (e) => {
            if ((e.originalEvent.target as HTMLElement).id !== "map") return;
            if (marker) marker.remove();

            marker = generateMarker(e.latlng.lat, e.latlng.lng);
            marker.addTo(trackedMap);

            toastStore.trigger(toastMessage);
            trackedMap.setView([e.latlng.lat, e.latlng.lng], 20);

            const w3w = await getW3W(e.latlng.lat, e.latlng.lng);
            dispatch("what3words", {
                text: w3w,
            });
        };

        trackedMap.on("click", addMarker);

        loading = false;
    };

    const removeMap = () => {
        loading = true;
        trackedMap.remove();
    };

    onMount(() => initMap());
    beforeNavigate(() => removeMap());
</script>

<!-- HTML Markup -->
{#if loading}
    <div class="flex justify-center min-h-screen items-center">
        <SpinnerLoader />
    </div>
{/if}

<svelte:head>
    <script type="module" src="https://cdn.what3words.com/javascript-components@4.1.0-alpha.12/dist/what3words/what3words.esm.js"></script>
</svelte:head>

<div class="h-[490px]">
    <div id="map" class="h-full w-full rounded-md relative">
        <div class="absolute top-4 left-4 flex flex-col gap-2 z-[999]">
            <button class="w-8 h-8 rounded-md bg-white border shadow-md" on:click={zoomToUserLocation}>
                <img src="/assets/modal/crosshair.svg" alt="Zoom to user location" class="w-8 h-8" />
            </button>

            <button class="w-8 h-8 rounded-md bg-white border shadow-md" on:click={zoomToExtends}>
                <img src="/assets/modal/arrows-out.svg" alt="Zoom to extends" class="w-8 h-8" />
            </button>
        </div>
        <div class="absolute right-4 bottom-8 flex flex-col gap-2 z-[999]">
            <button class="w-8 h-8 rounded-md bg-white border shadow-md" on:click={zoomIn}>
                <img src="/assets/modal/magnifying-glass-plus.svg" alt="Zoom in" class="w-8 h-8" />
            </button>

            <button class="w-8 h-8 rounded-md bg-white border shadow-md" on:click={zoomOut}>
                <img src="/assets/modal/magnifying-glass-minus.svg" alt="Zoom out" class="w-8 h-8" />
            </button>
        </div>
    </div>
</div>
<div class={`${modalOpen ? "fixed" : "hidden"} bg-black/30 inset-0 flex items-center justify-center z-[1000]`}>
    <div class="bg-white/70 rounded-md shadow border py-4 px-6 m-8">
        <div class="flex flex-col">
            <h3>
                We're using <a href="https://what3words.com/amused.thunder.wins" class="unstyled btn-xl p-0 no-underline text-red-400">what3words</a>
                which offers super accurate location information.
            </h3>
            <h3>But there are few things that need to be done...</h3>
            <h4 class="my-4">To send the location:</h4>
            <ul class="space-y-4">
                <li class="flex items-center gap-6">
                    <img src="assets/modal/stack.svg" alt="Mouse click icon" class="rounded-full" />
                    <p>You can turn on the hybrid map for more detail</p>
                </li>
                <li class="flex items-center gap-6">
                    <img src="assets/modal/crosshair.svg" alt="Zoom in to my location" class="rounded-full" />
                    <p>Click the "Zoom to my location" button</p>
                </li>
                <li class="flex items-center gap-6">
                    <img src="assets/modal/hash.svg" alt="Grid icon" class="rounded-full" />
                    <p>Zoom in further until the grid lines appear</p>
                </li>
                <li class="flex items-center gap-6">
                    <img src="assets/modal/hand-pointing.svg" alt="Mouse click icon" class="rounded-full" />
                    <p>Then click on the map to select the location</p>
                </li>
            </ul>
        </div>
        <div class="flex justify-end">
            <button class="primary-button" on:click={() => (modalOpen = false)}> Continue </button>
        </div>
    </div>
</div>
