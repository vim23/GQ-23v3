<script lang="ts">
    import "../app.css";
    import "@skeletonlabs/skeleton/styles/all.css";

    import { afterUpdate, onMount } from "svelte";
    import { invalidate } from "$app/navigation";
    import { supabaseClient } from "$lib/db";
    import { toastStore, Modal, Toast } from "@skeletonlabs/skeleton";
    import "$lib/db";

    import { pwaInfo } from "virtual:pwa-info";

    let ready = false;
    onMount(() => {
        ready = true;
    });

    let ReloadPrompt: any;
    onMount(async () => {
        const L = await import("leaflet");
        pwaInfo && (ReloadPrompt = (await import("$lib/components/AppReloadPrompt/ReloadPrompt.svelte")).default);

        const {
            data: { subscription },
        } = supabaseClient.auth.onAuthStateChange(() => {
            invalidate("supabase:auth");
        });

        return () => {
            subscription.unsubscribe();
        };
    });

    // this sets up automatic token refreshing
    toastStore.subscribe(() => {
        console.log($toastStore);
    });

    $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : "";
</script>

<svelte:head>
    <title>Get the Picture Surveys</title>
    <meta
        name="description"
        content="A powerful crowdsourcing app driven by community members like you, so that we build a
    better society together."
    />
    {@html webManifest}
    <script type="module" src="https://cdn.what3words.com/javascript-components@4.1.0-alpha.12/dist/what3words/what3words.esm.js"></script>
</svelte:head>

<Modal />
<slot />
<Toast background="bg-surface-100" position="br" variant="filled" duration={350} color="bg-primary-800" />

{#if ReloadPrompt}
    <svelte:component this={ReloadPrompt} />
{/if}
