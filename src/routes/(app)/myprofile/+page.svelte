<script lang="ts">
    import { onMount } from "svelte";
    import type { AuthSession } from "@supabase/supabase-js";
    import { supabaseClient } from "$lib/db";
    import { FileButton } from "@skeletonlabs/skeleton";
    import { invalidateAll } from "$app/navigation";

    export let data;
    let session = data?.session as AuthSession;

    let loading = false;
    let username: string | null = null;
    let avatarUrl: string | null = null;
    let files: FileList;

    $: files ? console.log("File is:", files[0]) : null;

    onMount(() => {
        getProfile();
    });

    const getProfile = async () => {
        try {
            loading = true;
            const { user } = session;
            console.log("user is:", user);
            const { data, error, status } = await supabaseClient.from("user").select(`username, avatar`).eq("id", user.id).single();

            if (data) {
                console.log("data is:", data);
                username = data?.username;
                avatarUrl = data?.avatar;
            }

            if (error && status !== 406) throw error;
        } catch (error) {
            if (error instanceof Error) {
                console.log("error is:", error);
                return error.message;
            }
        } finally {
            loading = false;
        }
    };

    const updateProfile = async () => {
        loading = true;

        const accountData = new FormData();
        accountData.append("image", files?.[0] || null);
        accountData.append("username", username || "");

        await fetch("/myprofile?/updateAvatar", {
            method: "POST",
            body: accountData,
        });

        await invalidateAll();

        loading = false;
    };
</script>

<form class="form-widget flex flex-col w-80 space-y-5 mt-24 mx-auto" on:submit|preventDefault={updateProfile}>
    <div class="flex items-center justify-center">
        <img src={avatarUrl || "/images/placeholder.jpg"} alt="avatar" class="w-24 h-24 rounded-full" />
    </div>
    <div>
        <label
            >Username
            <input type="text" value={username} minlength="3" on:input={(e) => (username = e.currentTarget.value)} />
        </label>
    </div>

    <div class="w-full">
        <label for="avatar">Upload photo</label>
        <FileButton bind:files button={files ? "secondary-button w-full pointer-events-none" : "warning-button w-full"}
            >{files ? "File Uploaded" : "Upload File"}</FileButton
        >
        {#if files}<p class="py-2">{files[0].name} ready for upload</p>{/if}
    </div>

    <div>
        <input type="submit" class="primary-button" value={loading ? "Loading..." : "Update"} disabled={loading} />
    </div>

    <div>
        <button
            class="error-button w-full"
            on:click={() => {
                const confirmed = confirm("Are you sure you want to delete your profile?");
                if (!confirmed) return;

                loading = true;

                fetch("/myprofile?/deleteProfile", {
                    method: "POST",
                }).then(() => {
                    window.localStorage.clear();
                    window.location.href = "/";
                });
            }}>Delete profile</button
        >
    </div>
</form>
