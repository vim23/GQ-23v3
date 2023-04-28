<script lang="ts">
    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import { storeLightSwitch, storePrefersDarkScheme } from "@skeletonlabs/skeleton";
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    let darkMode = false;
    if (storePrefersDarkScheme) {
        darkMode = true;
    }

    let ready = false;
    onMount(() => (ready = true));

    let termsAccepted = false;
</script>

{#if ready}
    <div>
        <main>
            <div class="main-content h-screen flex flex-col overflow-y-auto">
                <!-- Logo Container -->
                <div class="">
                    <div class="lg:grid grid-cols-2 lg:mt-8 lg:mx-4">
                        <div
                            class="flex flex-col mx-4 gap-2 justify-center items-center mt-10"
                            in:fly={{ x: -50, duration: 600, delay: 600 }}
                            out:fade={{ duration: 300 }}
                        >
                            <!-- svelte-ignore a11y-img-redundant-alt -->
                            <img src="/assets/main_logo.svg" alt="Get the Picture Surveys Logo" class="w-16 sm:w-20" />
                            <div
                                class="logo-title font-sans text-2xl text-center font-bold drop-shadow-[0_6.05352px_10.0892px_rgba(0,0,0,0.15)] sm:text-4xl lg:text-5xl lg:m-0 lg:drop-shadow-2xl"
                            >
                                Get the Picture Surveys
                            </div>
                            <h4 class="text-center text-sm sm:text-base lg:text-lg">Bay Reporter app</h4>
                        </div>
                        <div class="flex justify-center mt-2 lg:flex lg:items-end" in:fly={{ x: 50, duration: 600, delay: 1000 }} out:fade={{ duration: 300 }}>
                            <p class="unstyled text-center text-lg sm:text-xl w-60 lg:w-96 lg:text-2xl lg:drop-shadow-lg">
                                A powerful crowdsourcing app driven by community members like you, so that we build a better society together.
                            </p>
                        </div>
                        <div class="hidden lg:block col-span-2">
                            <hr class="mx-8 mt-16" in:fade={{ duration: 2500, delay: 300 }} out:fade={{ duration: 300 }} />
                        </div>
                        <!-- Sign up Buttons -->
                        <div class="flex justify-center w-full col-span-2 lg:mt-10">
                            <div class="flex justify-center py-4 items-center">
                                <input class="checkbox" type="checkbox" bind:checked={termsAccepted} />
                                <span class="ml-1 inline-block">
                                    Agree to our <a href="/termsAndConditions" class="text-primary-400">Terms of Service</a>
                                </span>
                            </div>
                        </div>
                        <div
                            class="button-container mt-10 flex flex-col gap-6 w-56 mx-auto lg:col-span-2 lg:mt-2"
                            in:fly={{ y: 50, duration: 600, delay: 1500 }}
                            out:fade={{ duration: 300 }}
                        >
                            <button
                                on:click={() => {
                                    if (termsAccepted) {
                                        goto("/auth/registration");
                                    } else {
                                        if (!browser) return;
                                        alert("Please agree to our Terms of Service");
                                    }
                                }}
                                class="secondary-button">Sign up</button
                            >
                            <button
                                on:click={() => {
                                    if (termsAccepted) {
                                        goto("/auth/login");
                                    } else {
                                        if (!browser) return;
                                        alert("Please agree to our Terms of Service");
                                    }
                                }}
                                class="primary-button"
                                >Sign in
                            </button>
                            <a href="/" class="secondary-button">Learn more </a>
                        </div>
                    </div>
                    <div
                        hidden={$page.url.pathname === "/home" || $page.url.pathname === "/addReport" || $page.url.pathname === "/map" ? true : false}
                        in:fly={{ x: -50, duration: 600, delay: 2000 }}
                        out:fade={{ duration: 300 }}
                    >
                        <div class="flex justify-center space-x-2 mt-10 mb-1">
                            <p class="unstyled text-sm font-medium">
                                Enable {$storeLightSwitch ? "Light Mode" : "Dark Mode"}
                            </p>
                            <LightSwitch aria-checked={darkMode ? "true" : false} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
{:else}
    <div class="flex justify-center min-h-screen items-center">
        <SpinnerLoader />
    </div>
{/if}
