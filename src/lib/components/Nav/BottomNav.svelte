<script>
    import { fly, fade } from "svelte/transition";
    import "@skeletonlabs/skeleton/styles/all.css";
    import { page } from "$app/stores";
</script>

<nav class="shrink-0">
    <div
        class=" flex h-full justify-around items-center gap-2 bg-slate-100 drop-shadow-2xl py-2"
        in:fly={{ x: -50, duration: 300, delay: 300 }}
        out:fade={{ duration: 300 }}
    >
        <div>
            <a
                data-sveltekit-reload
                href="/map"
                class="unstyled m-0 flex flex-col items-center gap-1 hover:opacity-100 no-underline {$page.url.pathname === '/map'
                    ? 'opacity-100'
                    : 'opacity-50'}"
                ><img src="/assets/navIcons/home_icon.svg" alt="Map" class="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                <p class="unstyled text-xs sm:text-base dark:text-black">Home</p>
            </a>
        </div>
        <div>
            <a
                href="/home"
                class="unstyled m-0 flex flex-col items-center gap-1 hover:opacity-100 no-underline {$page.url.pathname === '/home'
                    ? 'opacity-100'
                    : 'opacity-50'}"
                ><img src="/assets/modal/files.svg" alt="Latest Reports" class="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                <p class="unstyled text-xs sm:text-base dark:text-black">Latest Reports</p>
            </a>
        </div>
        <div>
            <a
                href="/addReport"
                class="unstyled m-0 flex flex-col items-center gap-1 hover:opacity-100 no-underline {$page.url.pathname === '/addReport'
                    ? 'opacity-100'
                    : 'opacity-50'}"
                ><img src="/assets/navIcons/addReport_icon.svg" alt="Add Report" class="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                <p class="unstyled text-xs sm:text-base dark:text-black">Add Report</p>
            </a>
        </div>
        <div>
            <a
                href="/myreports"
                class="unstyled m-0 flex flex-col items-center gap-1 hover:opacity-100 no-underline {$page.url.pathname === '/myreports'
                    ? 'opacity-100'
                    : 'opacity-50'}"
                ><img src="/assets/navIcons/reports_icon.svg" alt="My Reports" class="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                <p class="unstyled text-xs sm:text-base dark:text-black">My Reports</p>
            </a>
        </div>
        <div>
            <a
                href="/myprofile"
                class="unstyled m-0 flex flex-col items-center gap-1 hover:opacity-100 no-underline {$page.url.pathname === '/myprofile'
                    ? 'opacity-100'
                    : 'opacity-50'}"
                ><img src="/assets/navIcons/account_icon.svg" alt="Notifications" class="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                <p class="unstyled text-xs sm:text-base dark:text-black">My Profile</p>
            </a>
        </div>
    </div>
</nav>
