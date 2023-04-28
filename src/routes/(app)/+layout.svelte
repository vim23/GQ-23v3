<script lang="ts">
    import { onMount } from "svelte";
    import { enhance } from "$app/forms";
    import { beforeNavigate } from "$app/navigation";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import { AppBar } from "@skeletonlabs/skeleton";
    import { Avatar } from "@skeletonlabs/skeleton";
    import { Drawer } from "@skeletonlabs/skeleton";
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import { storeLightSwitch } from "@skeletonlabs/skeleton";
    import { drawerStore } from "@skeletonlabs/skeleton";
    import { getInitials } from "$lib/utils/helperFunctions";
    import BottomNav from "$lib/components/Nav/BottomNav.svelte";
    import { supabaseClient } from "$lib/db";

    export let data;

    let loading = false;
    let mounted = false;

    let session = data?.session;
    let userId = session?.user?.id as string | undefined;
    let email = session?.user?.email as string | undefined;
    let avatar = session?.user?.user_metadata?.avatar_url as string | undefined;
    let username = session?.user?.user_metadata?.username as string | undefined;

    const loadUserData = async () => {
        loading = true;

        const { data, error } = await supabaseClient.from("user").select(`username, avatar`).eq("id", userId).single();

        if (error) return console.error(error);
        if (!data) return console.error("No data found");

        username = data?.username || undefined;
        avatar = data?.avatar || undefined;

        loading = false;
    };

    onMount(() => {
        mounted = true;
        loadUserData();
    });

    const logout = async () => {
        if (!mounted) return console.error("Not mounted");

        loading = true;

        await supabaseClient.auth.signOut();
        window.localStorage.clear();
        window.location.href = "/";
    };

    const drawerOpen = () => {
        drawerStore.open({
            position: "left",
            width: "w-54",
        });
    };

    const drawerClose = () => {
        drawerStore.close();
    };

    beforeNavigate(drawerClose);

    let isFAQOpen = false;
    const toggleFAQ = () => (isFAQOpen = !isFAQOpen);
</script>

{#if loading}
    <div class="flex justify-center items-center fixed inset-0">
        <SpinnerLoader />
    </div>
{/if}
<Drawer>
    <nav class="list-nav">
        <!-- (optionally you can provide a label here) -->
        <ul>
            <li>
                <a href="/home" on:click={drawerClose}>
                    <span class="badge bg-primary-500"><img src="/assets/navIcons/home_icon.svg" alt="Home" class="drop-shadow-2xl" /></span>
                    <span class="flex-auto"><li><a href="/home" class="text-sm">Home</a></li></span>
                </a>
            </li>
            <li>
                <a href="/home" on:click={drawerClose}>
                    <span class="badge bg-primary-500"><img src="/assets/navIcons/reports_icon.svg" alt="Reports" class="drop-shadow-2xl" /></span>
                    <span class="flex-auto"
                        ><li>
                            <a href="/myreports" class="text-sm">My reports</a>
                        </li></span
                    >
                </a>
            </li>
            <li>
                <a href="/addReport" on:click={drawerClose}>
                    <span class="badge bg-primary-500 w-9 h-7"><img src="/assets/edit.svg" alt="Add Report" /></span>
                    <span class="flex-auto"
                        ><li>
                            <a href="/addReport" class="text-sm">Add new report</a>
                        </li></span
                    >
                </a>
            </li>
            <li hidden>
                <a href="/home" on:click={drawerClose}>
                    <span class="badge bg-primary-500"><img src="/assets/navIcons/bell_icon.svg" alt="Notifications" class="drop-shadow-2xl" /></span>
                    <span class="flex-auto"
                        ><li>
                            <a href="/home" class="text-sm">Notifications</a>
                        </li></span
                    >
                </a>
            </li>
            <li>
                <a href="/map" data-sveltekit-reload on:click={drawerClose}>
                    <span class="badge bg-primary-500"><img src="/assets/navIcons/map_icon.svg" alt="Map" class="drop-shadow-2xl" /></span>
                    <span class="flex-auto"><li><a href="/map" data-sveltekit-reload class="text-sm">Map</a></li></span>
                </a>
            </li>
            <li>
                <a href="/myprofile" on:click={drawerClose}>
                    <span class="badge bg-primary-500"><img src="/assets/navIcons/account_icon.svg" alt="My Account icon" class="drop-shadow-2xl" /></span>
                    <span class="flex-auto"
                        ><li>
                            <a href="/myprofile" class="text-sm">My profile</a>
                        </li></span
                    >
                </a>
            </li>
            <li>
                <form action="/auth/logout" method="POST" use:enhance={logout} class="pt-3">
                    <button type="submit" class="flex items-cente text-sm" on:click={drawerClose}
                        ><span class="flex items-center badge bg-primary-500 mr-8 w-9"
                            ><img src="/assets/log-out.svg" alt="Log out" class="drop-shadow-2xl" /></span
                        >Log out</button
                    >
                </form>
            </li>
            <li>
                <div class="flex pl-4 mt-6 mr-4 pt-6 flex-wrap gap-4">
                    <p class="unstyled text-sm">
                        Enable {$storeLightSwitch ? "Light Mode" : "Dark Mode"}
                    </p>
                    <br /><LightSwitch />
                </div>
            </li>
            <!-- ... -->
        </ul>
    </nav>
</Drawer>
<div class={`${isFAQOpen ? "fixed" : "hidden"} bg-black/30 inset-0 flex items-center justify-center z-[1000]`}>
    <div class="bg-white rounded-md shadow border py-4 px-6 m-8">
        <h3 class="font-semibold">How do I add a new Report?</h3>
        <p>Check on the Home page that a report has not already been added to the map</p>
        <p>If not, go to Add Report</p>
        <h3 class="font-semibold mt-4">How do I update a report?</h3>
        <p>Find the report marker on the map</p>
        <p>Click to open the popup and Update report</p>

        <div class="flex justify-end mt-4">
            <button class="error-button" on:click={toggleFAQ}> Close </button>
        </div>
    </div>
</div>
<AppBar padding="p-2 shrink-0">
    <svelte:fragment slot="lead">
        <button on:click={drawerOpen}>
            <img src="/assets/main_logo.svg" alt="Get the survey logo" class="w-14 h-14" />
        </button>
    </svelte:fragment>
    <h4 class="font-semibold">{username || email?.split("@").at(0) || "Anonymous"}</h4>
    <svelte:fragment slot="trail">
        <button on:click={toggleFAQ} class="warning-button">FAQ</button>
        <button on:click={logout} class="primary-button">Logout</button>
        {#if avatar}
            <Avatar src={avatar} />
        {:else}
            <Avatar initials={getInitials(email || "")} />
        {/if}
    </svelte:fragment>
</AppBar>
<div class="grow overflow-y-auto" id="scrollbox">
    <slot />
</div>
<BottomNav />
