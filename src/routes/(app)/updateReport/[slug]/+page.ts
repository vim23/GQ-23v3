import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import type { User } from "@supabase/supabase-js";
import type { PageLoad } from "./$types";

export let _user: User;
export const load = (async (event) => {
    const { supabaseClient, session } = await getSupabase(event);
    if (session!.user) {
        _user = session!.user;
    }

    let { data, error } = await supabaseClient.from("report").select("*, update (*)").order("repdt", { ascending: false });
    // insert validation here

    if (error) {
        return {
            status: 404,
            error: new Error("Report not found in database"),
        };
    }
    const reports = data?.find((report) => report.repid === event.params?.slug);

    return {
        data: reports,
        session,
    };
}) satisfies PageLoad;
