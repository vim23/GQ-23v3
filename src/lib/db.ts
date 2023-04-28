import { createClient } from "@supabase/auth-helpers-sveltekit";
import { env } from "$env/dynamic/public";
// or use the static env
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";

import type { Database } from "../types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY) as SupabaseClient<Database>;
