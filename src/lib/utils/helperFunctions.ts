import { DateTime } from "luxon";
import { PUBLIC_W3W_API } from "$env/static/public";

// This helper function extracts the geoJsonData from any subset array and returns a new array of geoJson objects of that subset/category.

export function extractGeoJsonData(dataQuery: any[]) {
    return dataQuery?.map((item) => {
        return item.geoJsonData;
    });
}

export function getInitials(email: string) {
    const [first, last] = email.split("@")[0].split(".");
    return `${first[0]}${last ? last[0] : ""}`;
}

export const todaysDate = () => {
    let date = new Date()
        .toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", hour12: false })
        .replace(/[/]/g, "")
        .replace(/[,]/g, "")
        .replace(/[:]/g, "")
        .replace(/ /g, "");

    return date;
};

// create a function that converts a timestampz to a ISO 8601 date string and then to a luxon DateTime object and then to a relative time string

// function to convert timestampz to ISO 8601 date string
export const convertTimestampzToISO8601 = (timestampz: string): string => {
    let date = new Date(timestampz);
    let isoDate = date.toISOString();
    return isoDate;
};

// function to convert ISO 8601 date string to luxon DateTime object
export const convertISO8601ToLuxonDateTime = (isoDate: string): DateTime => {
    let luxonDateTime = DateTime.fromISO(isoDate);
    return luxonDateTime;
};

// relative time function
export const relativeTime = (reportDate: string) => {
    let isoDate = convertTimestampzToISO8601(reportDate);
    let luxonDateTime = convertISO8601ToLuxonDateTime(isoDate);
    return luxonDateTime.toRelative();
};

// This function removes non-string characters from the string and sets it to sentence case and is used when setting the popup content
export function toSentenceCase(str: string) {
    return str
        ?.replace(/_/g, " ")
        ?.replace(/([A-Z])/g, " $1")
        ?.replace(/^./, function (str) {
            return str?.toUpperCase();
        });
}

// This function checks how many elements are in the array and returns the number as a string
export const countReports = (array: string | any[]) => {
    let count = array?.length;
    return count;
};

//This function converts an svg image to a blob
export const svgToBlob = (svg: string) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = svg;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
            return blob;
        });
    };
};

export const getW3wordsDetails = async (what3words: string): Promise<W3WordsDetails | null> => {
    try {
        const object: any = {};
        const what3wordsApi = `https://api.what3words.com/v3/convert-to-coordinates?words=${what3words}&key=${PUBLIC_W3W_API}`;
        const response = await fetch(what3wordsApi);
        const what3wordsData = await response.json();
        object.what3words = what3wordsData;

        const reverseGeoCodeApi = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${what3wordsData?.coordinates?.lat}&lon=${what3wordsData.coordinates.lng}`;
        const res = await fetch(reverseGeoCodeApi);
        const addressData = await res.json();
        object.address = addressData;

        return object;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export interface Southwest {
    lng: number;
    lat: number;
}

export interface Northeast {
    lng: number;
    lat: number;
}

export interface Square {
    southwest: Southwest;
    northeast: Northeast;
}

export interface Coordinate {
    lng: number;
    lat: number;
}

export interface What3word {
    country: string;
    square: Square;
    nearestPlace: string;
    coordinates: Coordinate;
    words: string;
    language: string;
    map: string;
}

export interface Addres {
    suburb: string;
    county: string;
    state: string;
    "iSO3166-2-lvl4": string;
    country: string;
    country_code: string;
}

export interface Property {
    place_id: number;
    osm_type: string;
    osm_id: number;
    place_rank: number;
    category: string;
    type: string;
    importance: number;
    addresstype: string;
    name: string;
    display_name: string;
    address: Addres;
}

export interface Geometry {
    type: string;
    coordinates: number[];
}

export interface Feature {
    type: string;
    properties: Property;
    bbox: number[];
    geometry: Geometry;
}

export interface Addres {
    type: string;
    licence: string;
    features: Feature[];
}

export interface W3WordsDetails {
    what3words: What3word;
    address: Addres;
}
