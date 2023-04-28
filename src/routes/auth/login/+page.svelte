<script>
    // @ts-nocheck

    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";
    import { afterUpdate } from "svelte";
    import { invalidateAll, goto } from "$app/navigation";
    import { applyAction, enhance } from "$app/forms";
    import SpinnerLoader from "$lib/components/UI/SpinnerLoader.svelte";
    import { page } from "$app/stores";
    import { storeLightSwitch, storePrefersDarkScheme } from "@skeletonlabs/skeleton";
    import { LightSwitch } from "@skeletonlabs/skeleton";

    let darkMode = false;
    if (storePrefersDarkScheme) {
        darkMode = true;
    }

    let loading = true;
    let ready = false;
    onMount(() => ((loading = false), (ready = true)));

    export let form;
    export let data;

    console.log("data from layout component, in login page", data);

    // /** @type {import('./$types').SubmitFunction } */
    const handleSubmit = () => {
        loading = true;
        return async ({ result }) => {
            console.log("result", result);
            await applyAction(result);
            if (result.type === "redirect") {
                await invalidateAll();
            }
            loading = false;
        };
    };
</script>

{#if loading}
    <div class="flex flex-col min-h-screen justify-center items-center">
        <SpinnerLoader />
        <h2 class="block">Logging in...</h2>
    </div>
{:else}
    <div class="h-screen flex flex-col items-center lg:justify-center" in:fly={{ x: -50, duration: 500, delay: 500 }} out:fade={{ duration: 300 }}>
        <div>
            <div>
                <form action="?/email" method="POST" use:enhance={handleSubmit}>
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
                            <!-- Email login -->
                            <div class="flex flex-col mx-auto gap-4 max-w-xs w-full lg:max-w-md lg:mx-auto">
                                <label for="email">
                                    <span class="font-medium text-lg"> Email </span>
                                    <input type="email" name="email" id="email" class="h-9 rounded-md px-3 text-sm w-10 border-2 border-slate-300" required />
                                </label>
                                <label for="password">
                                    <span class="font-medium text-lg">Password</span>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        class="h-9 rounded-md px-3 text-sm w-10 border-2 border-slate-300"
                                        required
                                    />
                                </label>
                            </div>
                            {#if form?.error}
                                <p class="unstyled text-red-500 text-center pt-4 font-bold">
                                    {form?.error}
                                </p>
                            {/if}
                            <div class="button-container mt-8 flex flex-col gap-8 w-72 mx-auto">
                                <button type="submit" class="primary-button">Sign in</button>
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
                                    <div in:fly={{ x: -50, duration: 300, delay: 300 }} out:fade={{ duration: 300 }} class="text-center">
                                        <footer>
                                            <p class="text-md">
                                                Don't have an account? <span class="font-medium hover:underline underline-offset-2"
                                                    ><a class="inline-block" href="/auth/registration/">Sign up</a></span
                                                >
                                            </p>
                                        </footer>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div hidden={$page.url.pathname === "/home" || $page.url.pathname === "/addReport" || $page.url.pathname === "/map" ? true : false}>
            <div class="flex justify-center space-x-2 mt-10 mb-1">
                <p class="unstyled text-sm font-medium">
                    Enable {$storeLightSwitch ? "Light Mode" : "Dark Mode"}
                </p>
                <LightSwitch aria-checked={darkMode ? "true" : false} />
            </div>
        </div>
    </div>
{/if}

<!-- <div class="flex justify-center min-h-screen items-center">
  <SpinnerLoader />
</div> -->
