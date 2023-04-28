import L from "leaflet";
import { PUBLIC_W3W_API } from "$env/static/public";
import type { GeoJsonObject } from "geojson";
import w3wService from "$lib/what3words";

const _layers = {
    osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxNativeZoom: 19,
        maxZoom: 25,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
    hybrid: L.tileLayer("http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
        maxZoom: 25,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }),
};

export const layers = L.control.layers({ OpenStreetMap: _layers.osm, Hybrid: _layers.hybrid });

export const map = L.map("map", {
    center: [-33.961293020371414, 25.620578755114934],
    zoom: 9,
    maxZoom: 23,
    layers: [_layers.osm],
    zoomControl: false,
});

const _marker = L.icon({
    iconUrl: "https://what3words.com/map/marker.png",
    iconSize: [64, 64],
    iconAnchor: [25, 59],
});

export const generateMarker = (lat: number, lng: number) => {
    return L.marker([lat, lng], {
        icon: _marker,
    });
};

export const zoomControl = L.control.zoom({
    position: "bottomright",
});

let controller: AbortController | undefined;
const _getGrid = async (map: L.Map): Promise<GeoJsonObject | null> => {
    if (controller) controller.abort();
    controller = new AbortController();

    const ne = map.getBounds().getNorthEast();
    const sw = map.getBounds().getSouthWest();

    const url = new URL("https://api.what3words.com/v3/grid-section");
    url.searchParams.append("key", PUBLIC_W3W_API);
    url.searchParams.append("bounding-box", `${ne.lat}, ${ne.lng}, ${sw.lat}, ${sw.lng}`);
    url.searchParams.append("format", "geojson");

    try {
        const response = await fetch(url.toString(), { signal: controller.signal });
        return await response.json();
    } catch (error) {
        if ((error as Error).name === "AbortError") return null;
        throw error;
    }
};

let _gridLayer: L.GeoJSON | undefined;

const _clearGrid = () => {
    if (_gridLayer) {
        _gridLayer.remove();
        _gridLayer = undefined;
    }
};

export const drawGrid = async (map: L.Map) => {
    _clearGrid();

    const zoom = map.getZoom();
    const loadFeatures = zoom > 19;
    if (!loadFeatures) return;

    const grid = await _getGrid(map);
    if (!grid) return;

    _clearGrid();

    _gridLayer = L.geoJSON(grid, {
        style: () => ({
            color: "orange",
            stroke: true,
            weight: 0.4,
        }),
    });

    _gridLayer.addTo(map);
};

export const getW3W = async (lat: number, lng: number): Promise<string> => {
    const response = await w3wService.convertTo3wa({ coordinates: { lat, lng } });
    return response.words;
};
