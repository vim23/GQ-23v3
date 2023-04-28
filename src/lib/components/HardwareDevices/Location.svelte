<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    export let fetchedLocation = { lat: null, lng: null };
    import { Toast, toastStore } from "@skeletonlabs/skeleton";
    onMount(() => {
        let locationButton = document.getElementById("locationBtn");
        // @ts-ignore
        locationButton.style.display = "block";
    });

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    };

    const getMyLocation = () => {
        navigator.geolocation.getCurrentPosition(success, error, options);
        if (!("geolocation" in navigator)) {
            return;
        }

        /**
         * @param {{ coords: any; }} pos
         */
        function success(pos) {
            toastStore.clear();
            const crd = pos.coords;
            console.log(crd);
            fetchedLocation = { lat: crd.latitude, lng: crd.longitude };
            console.log("Your current position is:", fetchedLocation);
            console.log("Your current position is:");
            console.log(`Latitude : ${crd.latitude}`);
            console.log(`Longitude: ${crd.longitude}`);
            console.log(`More or less ${crd.accuracy} meters.`);
            toastStore.trigger(toastMessage);
        }

        /**
         * @param {{ code: any; message: any; }} err
         */
        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
    };

    const toastMessage = {
        message: "Thank you. Location successfully logged.",
        // Optional:
        autohide: true,
        timeout: 3000,
    };
</script>

<div class="flex flex-col gap-5">
    <button type="button" id="locationBtn" class="primary-button" on:click={getMyLocation}>Send location</button>
    <Toast background="bg-surface-100" position="br" variant="filled" duration={350} color="bg-primary-800" />
</div>
