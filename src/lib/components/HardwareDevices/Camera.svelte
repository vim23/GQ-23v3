<script lang="ts">
    import { Toast, toastStore } from "@skeletonlabs/skeleton";
    import { onMount } from "svelte";

    export let onCapture = null as ((data: Blob) => void) | null;

    let video: HTMLVideoElement | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let photo: HTMLImageElement | null = null;

    let streaming = false;
    let photoCaptured = false;
    let viewPortIsOpen = false;

    let width = 320;
    let height = 0;

    onMount(() => {
        video = document.getElementById("video") as typeof video;
        canvas = document.getElementById("canvas") as typeof canvas;
        photo = document.getElementById("photo") as typeof photo;

        if (!video || !canvas || !photo) return console.error("Incorrect mount of camera component");

        video.style.display = "block";
        canvas.style.display = "none";
        photo.style.display = "none";

        photoCaptured = false;
        viewPortIsOpen = true;

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "environment" }, audio: false })
            .then((stream) => {
                if (video) (<MediaStream>video.srcObject) = stream;
                video?.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });

        video?.addEventListener(
            "canplay",
            (ev) => {
                if (!streaming && video && canvas && photo) {
                    height = video.height / (video.width / width);

                    // Firefox currently has a bug where the height can't be read from
                    // the video, so we will make assumptions if this happens.

                    if (isNaN(height)) height = width / (4 / 3);

                    video.setAttribute("width", width.toString());
                    video.setAttribute("height", height.toString());
                    canvas.setAttribute("width", width.toString());
                    canvas.setAttribute("height", height.toString());
                    streaming = true;
                }
            },
            false
        );

        // Error handling
        video?.addEventListener(
            "error",
            (ev) => {
                console.error("Video error:", ev);
            },
            false
        );

        clearPhoto();
    });

    const closeVideoFeed = async () => {
        if (!video) return console.error("Cannot close video feed, video is null");

        (<MediaStream>video.srcObject).getTracks().forEach((stream) => stream.stop());

        video.srcObject = null;
        video.style.display = "none";
    };

    const clearPhoto = () => {
        const context = canvas?.getContext("2d");

        if (!context || !canvas) return console.error("Cannot clear photo, context or canvas is null");

        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const data = canvas.toDataURL("image/png");
        photo?.setAttribute("src", data);
    };

    const takePicture = () => {
        if (!photo || !video || !canvas) return console.error("Cannot take picture, photo, video or canvas is null");

        photo.style.display = "block";
        // video.style.display = 'none';
        const context = canvas.getContext("2d");
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context?.drawImage(video, 0, 0, width, height);
            const data = canvas.toDataURL("image/png");
            photo.setAttribute("src", data);

            canvas.toBlob((blob) => {
                if (blob === null) return console.log("Could not convert canvas to blob");
                if (onCapture) onCapture(blob);
            });

            photoCaptured = true;
        } else {
            clearPhoto();
        }
    };

    const toastMessage = {
        message: "Photo has been successfully captured.",
        // Optional:
        autohide: true,
        timeout: 3000,
    };
</script>

<div class="flex flex-col gap-5 overflow-y-auto my-2 items-center w-full justify-center">
    <video id="video" autoplay class="rounded-md">
        <track kind="captions" />
    </video>
    <canvas id="canvas" class="rounded-md" />
    <img id="photo" alt="" class="bg-black/50 h-[240px] w-[320px] rounded-md" />

    <button
        class={`primary-button`}
        on:click={() => {
            if (!photoCaptured) {
                toastStore.clear();
                takePicture();
                closeVideoFeed();
                toastStore.trigger(toastMessage);
            } else {
                photoCaptured = false;
                video?.play();

                if (!video || !canvas || !photo) return console.error("Incorrect mount of camera component");

                navigator.mediaDevices
                    .getUserMedia({ video: { facingMode: "environment" }, audio: false })
                    .then((stream) => {
                        if (video) video.srcObject = stream;
                        video?.play();
                    })
                    .catch((err) => {
                        console.error(`An error occurred: ${err}`);
                    });

                video.style.display = "block";
                canvas.style.display = "none";
                photo.style.display = "none";

                clearPhoto();
            }
        }}>{photoCaptured ? "Retake photo?" : "Capture"}</button
    >

    <Toast background="bg-surface-100" position="br" variant="filled" duration={350} color="bg-primary-800" />
</div>
