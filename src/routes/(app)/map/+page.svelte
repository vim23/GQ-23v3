<!-- Our script is here, this is where our logic is -->
<script lang="ts">
    import { onMount } from "svelte";
    import { beforeNavigate, invalidateAll } from "$app/navigation";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import "leaflet/dist/images/marker-shadow.png";
    import { formatDateSerial } from "$lib/date.js";

    export let data;
    let { dataReportWS, dataReportBA, dataReportSS, dataReportHE, dataReportSE, initialCoords, pointId } = data;

    let loading = true;
    let map: L.Map;

    const generatePopup = (layer: any) => {
        return `
            <div class="flex flex-col gap-2 max-h-[450px] overflow-y-auto px-2">
                <b>Report ID: ${layer?.feature.properties.repid}</b>
                <hr />
                <span>${layer?.feature?.properties?.category}: ${layer?.feature.properties.subcat}</span>
                ${layer?.feature.properties?.image ? `<img src="${layer?.feature.properties?.image}">` : ``}
                <span class="text-md font-bold">Near:</span>          
                <span class="">${layer?.feature?.properties?.address?.features[0]?.properties?.display_name.split(",").slice(1, 3).join(", ")}</span>
                <span class=""><span class="text-red-500">///</span>${layer?.feature?.properties?.what3words?.words}</span>
                <span class="text-md font-bold">Report:</span>
                <span class="">${layer?.feature?.properties?.report}</span>
                ${layer?.feature?.update
                    ?.sort((a: any, b: any) => new Date(a.updt).valueOf() - new Date(b.updt).valueOf())
                    ?.map((update: any, index: number) => {
                        return `
                        <hr />
                        <b>Update ID: U${index + 1}${layer?.feature?.catcode}${formatDateSerial(update.updt)}</b>
                        <b>${update.resolved ? "Resolved" : "Not resolved"}</b>
                        ${update.upimg ? `<img src="${update.upimg}">` : ``}
                        <span class="text-md font-bold">Update:</span>
                        <span class="">${update.update}</span>
                    `;
                    })
                    .join("")}
                ${
                    (layer?.feature?.update?.length || 0) < 3
                        ? `<a 
                                class="primary-button w-full h-max my-2 shrink-0 relative" 
                                href="/home?id=${layer?.feature?.properties?.repid}" 
                                data-sveltekit-reload
                            >
                                Update report
                                <span class="badge-icon variant-filled-secondary absolute -top-[0.65rem] -right-1 z-10">
                                    ${layer?.feature?.update?.length}
                                </span>
                            </a>`
                        : ``
                }
            </div>
    `;
    };
    onMount(async () => {
        await invalidateAll();
        await import("leaflet/dist/leaflet.css");
        await import("leaflet-control-geocoder/dist/Control.Geocoder.css");
        await import("leaflet.markercluster/dist/MarkerCluster.css");
        await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
        let L = await import("leaflet");
        await import("leaflet.markercluster");
        await import("leaflet.featuregroup.subgroup");
        const { Geocoder, geocoders } = await import("leaflet-control-geocoder");

        loading = false;

        let southWest = L.latLng(-34.0836, 25.1767);
        let northEast = L.latLng(-33.6405, 25.7954);

        map = L.map("map", {
            zoomControl: false,
        }).setView(initialCoords ? [initialCoords.lat, initialCoords.lng] : [-33.86605, 25.60749], initialCoords ? 16 : 9);

        let osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            opacity: 0.7,
            subdomains: ["a", "b", "c"],
        }).addTo(map);

        (southWest = L.latLng(-34.0836, 25.1767)), (northEast = L.latLng(-33.6405, 25.7954));

        let categories = window.L.markerClusterGroup({
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
        });

        categories.addTo(map);

        let mySubWSGroup = L.featureGroup.subGroup(categories, []);
        let mySubBAGroup = L.featureGroup.subGroup(categories, []);
        let mySubSSGroup = L.featureGroup.subGroup(categories, []);
        let mySubHEGroup = L.featureGroup.subGroup(categories, []);
        let mySubOTGroup = L.featureGroup.subGroup(categories, []);

        const createGeoLayer = (data: { geoJsonData: any }[], filter: string) =>
            L.geoJSON(
                data.map((r) => ({ ...r, ...r.geoJsonData })),
                {
                    coordsToLatLng(coords) {
                        return new L.LatLng(coords[0], coords[1]);
                    },
                    pointToLayer(feature, latlng) {
                        let myIcon = L.icon({
                            iconUrl: "assets/" + feature.properties.subcat + ".png",
                            shadowUrl: "/images/marker-shadow.png",
                            iconSize: [34, 34], // width and height of the image in pixels
                            iconAnchor: [17, 34], // point of the icon which will correspond to marker's location
                            shadowSize: [34, 34], // width, height of optional shadow image
                            popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
                        });
                        return L.marker(latlng, { icon: myIcon, title: feature.properties.repid });
                    },
                    filter: function (feature) {
                        return feature.properties.subcat === filter;
                    },
                }
            );

        const WL_Layer = createGeoLayer(dataReportWS, "Water Leak").addTo(mySubWSGroup);
        const WS_Layer = createGeoLayer(dataReportWS, "Sewage Leak").addTo(mySubWSGroup);
        const WP_Layer = createGeoLayer(dataReportWS, "Water Point").addTo(mySubWSGroup);
        const WD_Layer = createGeoLayer(dataReportWS, "Drainage").addTo(mySubWSGroup);
        const AP_Layer = createGeoLayer(dataReportBA, "Pothole").addTo(mySubBAGroup);
        const AS_Layer = createGeoLayer(dataReportBA, "Street Light").addTo(mySubBAGroup);
        const AB_Layer = createGeoLayer(dataReportBA, "Bridge Railing").addTo(mySubBAGroup);
        const AR_Layer = createGeoLayer(dataReportBA, "Road Sign").addTo(mySubBAGroup);
        const AM_Layer = createGeoLayer(dataReportBA, "Manhole Cover").addTo(mySubBAGroup);
        const ST_Layer = createGeoLayer(dataReportSS, "Traffic Hazard").addTo(mySubSSGroup);
        const SF_Layer = createGeoLayer(dataReportSS, "Fire Hazard").addTo(mySubSSGroup);
        const SC_Layer = createGeoLayer(dataReportSS, "Crime").addTo(mySubSSGroup);
        const SA_Layer = createGeoLayer(dataReportSS, "Animal Abuse").addTo(mySubSSGroup);
        const HW_Layer = createGeoLayer(dataReportHE, "Waste Dumping").addTo(mySubHEGroup);
        const HR_Layer = createGeoLayer(dataReportHE, "Rough Sleeping").addTo(mySubHEGroup);
        const HV_Layer = createGeoLayer(dataReportHE, "Alien Vegetation").addTo(mySubHEGroup);
        const OC_Layer = createGeoLayer(dataReportSE, "Complaint").addTo(mySubOTGroup);
        const OS_Layer = createGeoLayer(dataReportSE, "Suggestion").addTo(mySubOTGroup);

        let baseMaps = { OpenStreetMap: osm };

        mySubWSGroup = L.featureGroup.subGroup(categories, [WL_Layer, WS_Layer, WP_Layer, WD_Layer]).bindPopup(generatePopup);
        mySubBAGroup = L.featureGroup.subGroup(categories, [AP_Layer, AS_Layer, AB_Layer, AR_Layer, AM_Layer]).bindPopup(generatePopup);
        mySubSSGroup = L.featureGroup.subGroup(categories, [ST_Layer, SF_Layer, SC_Layer, SA_Layer]).bindPopup(generatePopup);
        mySubHEGroup = L.featureGroup.subGroup(categories, [HW_Layer, HR_Layer, HV_Layer]).bindPopup(generatePopup);
        mySubOTGroup = L.featureGroup.subGroup(categories, [OC_Layer, OS_Layer]).bindPopup(generatePopup);

        mySubWSGroup.addTo(map);
        mySubBAGroup.addTo(map);
        mySubSSGroup.addTo(map);
        mySubHEGroup.addTo(map);
        mySubOTGroup.addTo(map);

        const groupedOverlays = {
            "Water and Sewerage": mySubWSGroup,
            "Broken Asset": mySubBAGroup,
            "Safety and Security": mySubSSGroup,
            "Health and Environment": mySubHEGroup,
            "Something Else": mySubOTGroup,
        };

        new L.Control.Layers(baseMaps, groupedOverlays, {
            collapsed: false,
            hideSingleBase: true,
        }).addTo(map);

        let bbox = L.latLngBounds(southWest, northEast);

        new Geocoder({
            geocoder: new geocoders.Nominatim({
                geocodingQueryParams: {
                    viewbox: bbox.toBBoxString(),
                    limit: 1,
                    addressdetails: 1,
                    namedetails: 1,
                    city: "Gqeberha",
                },
            }),
            position: "topleft",
            placeholder: "Search by street address",
            collapsed: true,
        }).addTo(map);

        const pointToOpen = document.querySelector(`img[title=${pointId}]`) as HTMLImageElement;
        pointId && pointToOpen?.click();
    });

    beforeNavigate(async () => {
        loading = true;
        map?.remove();
        setTimeout(() => {
            loading = false;
        }, 2000);
    });

    // Zoom controls
    const zoomIn = () => map.zoomIn();
    const zoomOut = () => map.zoomOut();

    // Zoom to extents
    const zoomToExtends = () => {
        map.setView([-33.86605, 25.60749], 9);
    };

    // Zoom to user location
    const onLocationFound: L.LocationEventHandlerFn = async (e) => {
        const L = await import("leaflet");
        const radius = e.accuracy / 4;
        const circle = L.circle(e.latlng, radius).addTo(map);
        const popup = circle.bindPopup("Your approximate location").openPopup();
        setTimeout(() => {
            popup.remove();
            circle.remove();
        }, 3000);
    };

    const zoomToUserLocation = () => {
        map.locate({
            setView: true,
            maxZoom: 16,
            enableHighAccuracy: true,
        });
        map.on("locationfound", onLocationFound);
    };
</script>

<!-- HTML Markup -->
{#if loading}
    <div class="flex justify-center min-h-screen items-center">
        <SpinnerLoader />
    </div>
{/if}

<div id="map" class="relative h-full w-full">
    <div class="absolute top-12 left-3 flex flex-col gap-2 z-[999]">
        <button class="w-8 h-8 rounded bg-white border-2 outline-gray-400 border-gray-400 hover:border-gray-600" on:click={zoomToUserLocation}>
            <img src="/assets/modal/crosshair.svg" alt="Zoom to user location" class="w-full h-full" />
        </button>

        <button class="w-8 h-8 rounded bg-white border-2 outline-gray-400 border-gray-400 hover:border-gray-600" on:click={zoomToExtends}>
            <img src="/assets/modal/arrows-out.svg" alt="Zoom to extends" class="w-full h-full" />
        </button>
    </div>
    <div class="absolute right-4 bottom-8 flex flex-col gap-2 z-[999]">
        <button class="w-8 h-8 rounded bg-white border-2 outline-gray-400 border-gray-400 hover:border-gray-600" on:click={zoomIn}>
            <img src="/assets/modal/magnifying-glass-plus.svg" alt="Zoom in" class="w-full h-full" />
        </button>

        <button class="w-8 h-8 rounded bg-white border-2 outline-gray-400 border-gray-400 hover:border-gray-600" on:click={zoomOut}>
            <img src="/assets/modal/magnifying-glass-minus.svg" alt="Zoom out" class="w-full h-full" />
        </button>
    </div>
    <slot />
</div>
