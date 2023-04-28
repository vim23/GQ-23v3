import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import { AuthApiError } from "@supabase/supabase-js";
import { fail, redirect, type ActionFailure } from "@sveltejs/kit";
import type { Actions } from "./$types";
// import { supabaseClient } from '$lib/db';

import { PUBLIC_AUTH_CALLBACK_URL } from "$env/static/public";
export const prerender = false;
export const actions: Actions = {
    emailRegister: async (event): Promise<ActionFailure<{ error: string; values?: { email: string } }> | { message: string }> => {
        const { supabaseClient } = await getSupabase(event);
        const { request, url } = event;
        const formData = await request.formData();
        const email: string | FormDataEntryValue = formData.get("email")!;
        const password: string | FormDataEntryValue = formData.get("password")!;
        const username: string | FormDataEntryValue = formData.get("username")!;
        if (!email) {
            return fail(400, {
                error: "Please enter your email address",
            });
        }
        if (!password) {
            return fail(400, {
                error: "Please enter a password",
            });
        }
        const { error, data } = await supabaseClient.auth.signUp({
            email: String(email),
            password: String(password),
            options: {
                data: {
                    username: String(username),
                },
                emailRedirectTo: `${url.origin}/auth/login`,
            },
        });
        if (error) {
            if (error instanceof AuthApiError && error.status === 400) {
                return fail(400, {
                    error: "Invalid credentials.",
                    values: {
                        email: email as string,
                    },
                });
            }
            return fail(500, {
                error: "Server error. Try again later.",
                values: {
                    email: email as string,
                },
            });
        }
        return {
            message: "Please check your email for a magic link to log into the website.",
        };
    },
    googleLogin: async (event) => {
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
