import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import { supabaseClient } from "$lib/db";
import { formatDateSerial } from "$lib/date";

export const prerender = false;

export let _user: User;
export const load: PageServerLoad = async (event) => {
    const { session } = await getSupabase(event);
    _user = session!.user;
};

export const actions: Actions = {
    updateReport: async ({ request }) => {
        const formData = await request.formData();

        const reportId = formData.get("repid") as string;
        const newReport = formData.get("report") as string;
        const newImage = formData.get("image") as File;
        const resolved = formData.get("resolved") === "true";

        const { data: originalReport, error: originalReportError } = await supabaseClient.from("report").select("*, update (*)").eq("repid", reportId).single();

        if (originalReportError) {
            console.error("Error fetching original report:\n", originalReportError);
            return fail(400, { error: true });
        }

        if (!originalReport) {
            console.error("No report found with the given id");
            return fail(400, { error: true });
        }

        let newImageURL: string | undefined;
        if (newImage) {
            const what3words = (originalReport.geoJsonData as Record<string, any>)?.["properties"]?.["what3words"]?.["words"];
            const fileName = `${originalReport.category}_${originalReport.catcode}_${what3words}_${new Date().toISOString()}.png`;

            await supabaseClient.storage.from("update-images").upload(fileName, newImage, {
                contentType: newImage.type ?? "image/png",
                cacheControl: "3600",
                upsert: false,
            });

            newImageURL = supabaseClient.storage.from("update-images").getPublicUrl(fileName).data.publicUrl;
        }

        const updateDate = new Date();
        const serialDate = formatDateSerial(updateDate);

        const updateID = originalReport.update !== null && originalReport.update.length !== null
            ? `U${originalReport.update.length + 1}${originalReport.catcode}${serialDate}`
            : `U1${originalReport.catcode}${serialDate}`;


        const { error } = await supabaseClient.from("update").insert({
            uprepid: reportId,
            updater: _user.id,
            resolved,
            update: newReport,
            upimg: newImageURL,
            updt: updateDate.toISOString(),
            upid: updateID,
            upserial: serialDate,
        });

        if (error) {
            console.error("Error updating report:\n", error);
            return fail(400, { error: true });
        }

        return {
            status: 200,
            body: {
                data: {
                    uprepid: reportId,
                    updater: _user.id,
                    resolved,
                    update: newReport,
                    upimg: newImageURL,
                },
            },
        };
    },
};
