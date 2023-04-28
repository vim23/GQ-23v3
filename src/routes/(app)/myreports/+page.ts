import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import { redirect, type LoadEvent, type RequestEvent, type ServerLoadEvent } from "@sveltejs/kit";
export const prerender = false;
import type { PageLoad } from "./$types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase";

export const load = (async (event) => {
    const { supabaseClient: client, session } = await getSupabase(event);
    if (!session?.user) throw redirect(303, "/auth/login");

    const supabaseClient = client as SupabaseClient<Database>;

    const { data, error } = await supabaseClient
        .from("report")
        .select("*, update (*, updater (*)), reporter (*)")
        .order("repdt", { ascending: false })
        .eq("reporter", session.user.id);

    if (error) console.error(error);

    return { data, session };
}) satisfies PageLoad;
