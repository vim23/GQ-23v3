<script>
    // @ts-nocheck

    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { afterUpdate } from "svelte";
    import { goto, invalidateAll } from "$app/navigation";
    //   import Footer from '$lib/components/Footer.svelte';
    import { enhance, applyAction } from "$app/forms";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import { tooltip } from "@skeletonlabs/skeleton";
    // Included in 'all.css' and 'elements.css'
    import { modalStore } from "@skeletonlabs/skeleton";
    import { page } from "$app/stores";
    import { storeLightSwitch, storePrefersDarkScheme } from "@skeletonlabs/skeleton";
    import { LightSwitch } from "@skeletonlabs/skeleton";

    export let values = {};
    export let form;

    $: form?.message ? triggerAlert() : null;

    let loading = false;

    const handleSubmit = () => {
        loading = true;
        return async ({ result }) => {
            loading = false;
            console.log("result", result);
            await applyAction(result);
            if (result.type === "success") {
                await invalidateAll();
            }
            loading = false;
        };
    };

    let darkMode = false;
    if (storePrefersDarkScheme) {
        darkMode = true;
    }

    let ready = false;
    onMount(() => {
        ready = true;
    });

    function triggerAlert() {
        const alert = {
            type: "alert",
            title: "Thank you.",
            body: form?.message,
            buttonTextCancel: "Close",
            result: () => {
                goto("/auth/login", { invalidateAll: true });
                modalStore.clear();
                modalStore.close();
            },
        };
        modalStore.trigger(alert);
    }
</script>

{#if loading}
    <div class="flex justify-center min-h-screen items-center">
        <SpinnerLoader />
    </div>
{:else if ready}
    <div
        class="h-screen flex flex-col items-center overflow-y-auto lg:justify-center"
        in:fly={{ x: -50, duration: 300, delay: 300 }}
        out:fade={{ duration: 300 }}
    >
        <!-- <pre>queue: {JSON.stringify($toastStore, null, 2)}</pre> -->
        <div class="overflow-y-auto">
            <form action="?/emailRegister" method="POST" use:enhance={handleSubmit}>
                <!-- Logo Container -->
                <div class="flex flex-col gap-4 mx-6 mt-6 items-center lg:grid grid-cols-2 lg:mt-8 lg:gap-10">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                        class="flex flex-col pb-3 mx-4 gap-2 justify-center items-center mt-4 cursor-pointer lg:justify-start lg:m-0"
                        on:click={() => goto("/")}
                    >
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img src="/assets/main_logo.svg" alt="Get the Picture Surveys Logo" class="w-16 sm:w-20 lg:w-28" />
                        <div
                            class="logo-title font-sans text-2xl text-center font-bold drop-shadow-[0_6.05352px_10.0892px_rgba(0,0,0,0.15)] sm:text-4xl lg:text-6xl lg:m-0 lg:drop-shadow-2xl"
                        >
                            Get the Picture Surveys
                        </div>
                        <h4 class="text-center text-sm sm:text-base lg:text-lg">Bay Reporter app</h4>
                    </div>

                    <div class="col-span-1">
                        <!-- Form -->
                        <div class="flex flex-col mx-auto gap-4 max-w-xs w-full lg:max-w-md lg:mx-auto">
                            <label for="username">
                                <span class="w-fit font-medium text-lg">Username</span>
                                <input
                                    name="username"
                                    id="username"
                                    minlength="4"
                                    type="text"
                                    placeholder="Your online alias"
                                    required
                                    class="h-9 rounded-md px-3 text-sm w-10 border-2 border-slate-300"
                                />
                            </label>
                            <label for="email">
                                <span class="font-medium text-lg">Email</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={values?.email ?? ""}
                                    id="email"
                                    class="h-9 rounded-md px-3 text-sm w-10 border-2 border-slate-300"
                                    required
                                    autocomplete="email"
                                    placeholder="Email address"
                                />
                            </label>
                            <label for="password">
                                <span
                                    class="font-semibold text-lg"
                                    use:tooltip={{
                                        content: "Your password must be at least 6 characters long",
                                    }}>Password</span
                                >
                                <input
                                    type="password"
                                    name="password"
                                    value={values?.password ?? ""}
                                    id="password"
                                    class="h-9 rounded-md px-3 text-sm w-10 border-2 border-slate-300"
                                    required
                                    placeholder="Create your password"
                                />
                            </label>
                        </div>

                        <div class="button-container mt-8 flex flex-col gap-8 w-72 mx-auto">
                            {#if form?.error}
                                <p class="unstyled text-warning-500 text-center">
                                    {form?.error}
                                </p>
                            {/if}
                            <!-- Email Sign up -->
                            <button disabled={loading} type="submit" class="primary-button">Get started</button>

                            <!-- Google Sign up -->

                            <form action="?/googleLogin" method="POST">
                                <button type="submit" class="warning-button w-full">
                                    <img src="/assets/google_logo.svg" alt="Google Logo" class="w-6 mr-2" />
                                    Sign in with Google
                                </button>
                            </form>
                        </div>

                        <div class="flex justify-center mt-8">
                            <!--Footer  -->
                            {#if ready}
                                <div in:fly={{ x: -50, duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
                                    <div in:fly={{ x: -50, duration: 300, delay: 300 }} out:fade={{ duration: 300 }} class="text-center">
                                        <footer>
                                            <p class="text-md">
                                                Already have an account? <span class="font-medium hover:underline underline-offset-2"
                                                    ><a class="inline-block" href="/auth/login/">Sign in</a></span
                                                >
                                            </p>
                                        </footer>
                                    </div>
                                    <!-- <Footer /> -->
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </form>
            <div hidden={$page.url.pathname === "/home" || $page.url.pathname === "/addReport" || $page.url.pathname === "/map" ? true : false}>
                <div class="flex justify-center space-x-2 mt-10 mb-1">
                    <p class="unstyled text-sm font-medium">
                        Enable {$storeLightSwitch ? "Light Mode" : "Dark Mode"}
                    </p>
                    <LightSwitch aria-checked={darkMode ? "true" : false} />
                </div>
            </div>
        </div>
    </div>
{:else}
    <div class="flex justify-center min-h-screen items-center">
        <SpinnerLoader />
    </div>
{/if}
