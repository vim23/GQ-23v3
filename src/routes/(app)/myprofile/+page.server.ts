import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@supabase/auth-helpers-sveltekit";
import { supabaseClient } from "$lib/db";

export const prerender = false;

export let _user: User;
export const load: PageServerLoad = async (event) => {
    const { session } = await getSupabase(event);
    _user = session!.user;
};

export const actions: Actions = {
    updateAvatar: async ({ request }) => {
        const formData = await request.formData();
        const image = formData.get("image") as File | null;
        const username = formData.get("username") as string;

        if (!_user.id) return fail(400, { error: "No user id" });

        let publicUrl: string | undefined;
        console.log(image, _user.id, username);
        if (image) {
            const { error: storageError } = await supabaseClient.storage.from("avatars").upload(`${_user.id}_${image.name}.png`, image, {
                contentType: image.type ?? "image/png",
                cacheControl: "3600",
                upsert: true,
            });

            if (storageError) return fail(400, { error: storageError });

            publicUrl = supabaseClient.storage.from("avatars").getPublicUrl(`${_user.id}_${image.name}.png`).data.publicUrl;
        }

        const { error: userUpdateError } = await supabaseClient
            .from("user")
            .update((image as null) !== "null" ? { avatar: publicUrl, username } : { username })
            .eq("id", _user.id);

        if (userUpdateError !== null) return fail(400, { error: userUpdateError });

        return {
            status: 200,
            body: {
                data: {
                    avatar: publicUrl,
                },
            },
        };
    },
    deleteProfile: async ({ request }) => {
        const { error } = await supabaseClient.from("user").delete().eq("id", _user.id);
        if (error !== null) return fail(400, { error });

        return {
            status: 200,
            body: {
                data: {
                    deleted: true,
                },
            },
        };
    },
};
