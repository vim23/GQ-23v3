import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import { redirect } from "@sveltejs/kit";
export const prerender = false;
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const { supabaseClient, session } = await getSupabase(event);
    // console.log('session from inApp Layout Server Load', session);
    if (!session?.user) {
        throw redirect(303, "/auth/login");
    }

    let { data, error } = await supabaseClient.from("report").select("report, update (*)").order("repdt", { ascending: false });

    if (error) {
        console.log("Error from supabase server", error);
    } else {
        // console.log('Here is the data from Supabase', data);
        return {
            data,
            session,
        };
    }
};
