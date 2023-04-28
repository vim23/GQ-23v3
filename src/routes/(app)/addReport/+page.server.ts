import * as fs from "fs";

import type { Actions, PageServerLoad } from "./$types";
import { decode, encode } from "base64-arraybuffer";
import { fail, redirect } from "@sveltejs/kit";

import GeoJSON from "geojson";
import { PUBLIC_W3W_API } from "$env/static/public";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import { supabaseClient } from "$lib/db";
import { todaysDate } from "$lib/utils/helperFunctions";
import util from "util";

export const prerender = false;

export let _user: User;
export const load: PageServerLoad = async (event) => {
    const { session } = await getSupabase(event);
    if (session!.user) {
        _user = session!.user;
    }
};

let placeholderImg = "static/assets/main_logo.png";

// POST REQUEST HANDLER TO SUPABASE

const readFile = util.promisify(fs.readFile);

async function pngToBlob(filePath: fs.PathOrFileDescriptor) {
    const data = await readFile(filePath);
    return new Blob([data], { type: "image/png" });
}

export const actions: Actions = {
    addReport: async ({ request }) => {
        const form = await request.formData();

        const report = form.get("report") as string;
        const catcode = form.get("catcode") as string;
        const subcat = form.get("subcat") as string;
        const subcatcode = form.get("subcatcode") as string;
        const what3words = form.get("what3words") as string;
        const file = form.get("image") as File | null;

        let category = form.get("category") as string;
        let reportImage;
        let repimg;

        if (file && file?.type === "image/png") {
            const fileName = `${catcode}_${subcatcode}_${what3words}_${new Date().toISOString()}.png`;

            const fileAsArrayBuffer = await file.arrayBuffer();
            const buff = encode(fileAsArrayBuffer);

            const res = await supabaseClient.storage.from("report-images").upload(fileName, file, {
                contentType: "image/png",
                cacheControl: "3600",
                upsert: false,
            });

            console.log("This is the response from supabase: ", res);
            reportImage = supabaseClient.storage.from("report-images").getPublicUrl(fileName);
            console.log("Report image is: ", reportImage);
            repimg = reportImage.data.publicUrl;
        }
        if (file && file?.type !== "image/png") {
            const file = await pngToBlob(placeholderImg);
            console.log("File is: ", file);
            // append a file extension to the file name so that it can be uploaded to supabase storage
            const fileName = `${Math.random()}.png`;
            const fileAsArrayBuffer = await file!.arrayBuffer();
            const buff = encode(fileAsArrayBuffer);

            await supabaseClient.storage.from("report-images").upload(fileName, decode(buff), {
                contentType: file.type ?? "image/png",
                cacheControl: "3600",
                upsert: false,
            });
            reportImage = supabaseClient.storage.from("report-images").getPublicUrl(fileName);
            repimg = reportImage.data.publicUrl;
        }

        const object = {} as Record<string, File | number | string>;
        for (const [key, value] of form as unknown as Array<string>) {
            object[key] = value;
        }

        // create a function that converts what3words to lat and long
        const what3wordsApi = `https://api.what3words.com/v3/convert-to-coordinates?words=${what3words}&key=${PUBLIC_W3W_API}`;
        const response = await fetch(what3wordsApi);
        const what3wordsData = await response.json();
        object.what3words = what3wordsData;

        const reverseGeoCodeApi = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${what3wordsData?.coordinates?.lat}&lon=${what3wordsData.coordinates.lng}`;
        const res = await fetch(reverseGeoCodeApi);
        const addressData = await res.json();
        object.address = addressData;
        object.image = repimg as string;
        object.user = _user.user_metadata.username;
        object.repserial = todaysDate();
        object.repid = `${subcatcode}${object.repserial}`;
        object.update = "";
        object.replaty = what3wordsData?.coordinates?.lat;
        object.replonx = what3wordsData.coordinates.lng;
        object.location = JSON.stringify({
            lat: what3wordsData?.coordinates?.lat,
            lng: what3wordsData.coordinates.lng,
        });

        // const parsedLoc = JSON.parse(reploc.toString());
        // object.replaty = parsedLoc.lat;
        // object.replonx = parsedLoc.lng;

        // @ts-ignore
        const geoJSONdata = GeoJSON.parse(object, {
            Point: ["replonx", "replaty"],
        });

        console.log("GeoJSON data is:", geoJSONdata);
        const completeReport = {
            repserial: object.repserial,
            repid: object.repid,
            report,
            catcode,
            category,
            subcat,
            reploc: geoJSONdata,
            replaty: what3wordsData?.coordinates?.lat,
            replonx: what3wordsData.coordinates.lng,
            reppoint: JSON.stringify(addressData),
            repimg,
            repdt: todaysDate(),
            geoJsonData: geoJSONdata,
            addressData: object.address,
            reporter: {
                connect: {
                    id: _user.id,
                },
            },
        };

        console.log("completeReport is :", completeReport);

        const { data, error } = await supabaseClient.from("report").insert([
            {
                repserial: completeReport.repserial,
                report,
                catcode: subcatcode,
                category: catcode,
                subcat,
                reploc: geoJSONdata.properties.location,
                replaty: what3wordsData?.coordinates?.lat,
                replonx: what3wordsData.coordinates.lng,
                reppoint: geoJSONdata.geometry,
                repimg,
                reporter: _user.id,
                geoJsonData: geoJSONdata,
                addressData: object.address as string,
                repid: completeReport.repid,
                location: `POINT(${what3wordsData?.coordinates?.lat} ${what3wordsData.coordinates.lng})`,
            },
        ]);

        if (data) {
            console.log("Report submitted successfully", data);
            return {
                status: 200,
                body: {
                    data,
                },
            };
        }

        if (error) {
            console.log("Error submitting the report!!!", error.message, "details:", error.details, "hint:", error.hint, error.code);
            return fail(400, { error: true });
        }

        throw redirect(303, "/home");
    },

    reportsInView: async ({ request }) => {
        const formData = await request.formData();

        const lat = parseFloat(formData.get("lat") as string);
        const lng = parseFloat(formData.get("lng") as string);
        const distance = parseFloat(formData.get("distance") as string);
        const name = formData.get("name") as string;

        const reports = await supabaseClient.rpc("reports_in_view", {
            name: name,
            max_lat: lat + distance,
            min_lat: lat - distance,
            max_long: lng + distance,
            min_long: lng - distance,
        });

        console.log(reports, {
            name: name,
            max_lat: lat + distance,
            min_lat: lat - distance,
            max_long: lng + distance,
            min_long: lng - distance,
        });

        return reports.data as Array<{ repid: string; subcat: string; location: string }>;
    },
};
