export const prerender = false;

import { supabaseClient } from "$lib/db";
import type { PageLoad } from "./$types";

const getData = async (categoryFilter: string | null) => {
    const baseQuery = supabaseClient.from("report").select("*, update (*)").order("repdt", { ascending: false });
    return (categoryFilter ? await baseQuery.textSearch("category", categoryFilter) : await baseQuery).data;
};

export const load = (async ({ url }) => {
    let data = {} as any;

    data.dataReport = await getData(null);
    data.dataReportWS = data.dataReport ? data.dataReport.filter((report: any) => report.category === "water_and_sewerage") : [];
    data.dataReportBA = data.dataReport ? data.dataReport.filter((report: any) => report.category === "broken_asset") : [];
    data.dataReportSS = data.dataReport ? data.dataReport.filter((report: any) => report.category === "safety_and_security") : [];
    data.dataReportHE = data.dataReport ? data.dataReport.filter((report: any) => report.category === "health_and_environment") : [];
    data.dataReportSE = data.dataReport ? data.dataReport.filter((report: any) => report.category === "social_and_economic") : [];

    const lat = url.searchParams.get("lat");
    const lng = url.searchParams.get("lng");

    const initialCoords = {
        lat: lat ? parseFloat(lat) : 0,
        lng: lng ? parseFloat(lng) : 0,
    };

    const pointId = url.searchParams.get("id");

    return { ...data, initialCoords: lat && lng ? initialCoords : null, pointId };
}) satisfies PageLoad;
