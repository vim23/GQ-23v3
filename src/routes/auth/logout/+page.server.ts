import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
export const prerender = false;
import type { Actions } from './$types';

export const actions: Actions = {
  default: async (event) => {
    const { supabaseClient } = await getSupabase(event);
    await supabaseClient.auth.signOut();
    throw redirect(303, 'auth/login');
  },
};
