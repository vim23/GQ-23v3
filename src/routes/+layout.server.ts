import { getServerSession } from "@supabase/auth-helpers-sveltekit";
import type { LayoutServerLoad } from "./$types";
import { supabaseClient } from "$lib/db";

export const prerender = false;

export const load = (async (event) => {
    let session = await getServerSession(event);

    //console.log("session data in root layout server load", session);
    if (!session) {
        return {
            data: null,
            session: null,
        };
    } else {
        // console.log('session data in root layout server load', session);
        const { data } = await supabaseClient.from("user").select("*").eq("id", session?.user?.id);

        return {
            data,
            session,
        };
    }
}) satisfies LayoutServerLoad;
