import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { Database } from "../../../types/supabase";

import type { PageLoad } from "./$types";

export const load = (async (event) => {
    const { supabaseClient: client, session } = await getSupabase(event);
    if (!session?.user) throw redirect(303, "/auth/login");

    const supabaseClient = client as SupabaseClient<Database>;

    const { data, error } = await supabaseClient.from("report").select("*, update (*, updater (*)), reporter (*)").order("repdt", { ascending: false });

    if (error) console.error(error);

    return { data, session, id: event.url.searchParams.get("id") };
}) satisfies PageLoad;
