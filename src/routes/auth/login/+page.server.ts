import { redirect, fail, type ActionFailure } from "@sveltejs/kit";
import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import { AuthApiError } from "@supabase/supabase-js";
import type { PageServerLoad, Actions } from "./$types";
import { PUBLIC_AUTH_CALLBACK_URL } from "$env/static/public";
export const prerender = false;

export const load: PageServerLoad = async (event) => {
    const { session } = await getSupabase(event);
    console.log("session data in login page load", session);
    if (session?.user) {
        throw redirect(303, "/map");
    }
};

export const actions: Actions = {
    email: async (event): Promise<ActionFailure<{ error: string; values?: { email: string } }>> => {
        const { request } = event;
        const { supabaseClient } = await getSupabase(event);
        const formData = await request.formData();

        const email: string | FormDataEntryValue = formData.get("email")!;
        const password: string | FormDataEntryValue = formData.get("password")!;

        if (!email) {
            return fail(400, {
                error: "Please enter your email",
            });
        }
        if (!password) {
            return fail(400, {
                error: "Please enter your password",
                values: {
                    email: email as string,
                },
            });
        }
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email as string,
            password: password as string,
        });

        if (error) {
            if (error instanceof AuthApiError && error.status === 400) {
                return fail(400, {
                    error: "Invalid credentials. Please check your email and password. Alternatively, please sign up if you do not have an account.",
                    values: {
                        email: email as string,
                    },
                });
            }
            return fail(500, {
                error: `Server error. Try again later.`,
                values: {
                    email: email as string,
                },
            });
        }
        throw redirect(303, "/map");
    },

    async googleLogin(event) {
        const { supabaseClient } = await getSupabase(event);
        const { data } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                // remember to change the address to http://127.0.0.1:4173/home when running the build script, else the google redirect will fail.
                redirectTo: PUBLIC_AUTH_CALLBACK_URL,
            },
        });

        const { url } = data;
        console.log("Google redirect Url", url);

        throw redirect(303, url!);
    },
};
