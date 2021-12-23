// Resize
videoBannerCheck();

window.addEventListener("resize", () => {
    videoBannerCheck();
});

function videoBannerCheck() {
    let videoBanners = document.querySelectorAll(".fullscreenAsset");
    console.log(videoBanners);
    let intViewportHeight = window.innerHeight;
    let intViewportWidth = document.body.clientWidth;

    let style = getComputedStyle(videoBanners[0]);
    let height = parseInt(style.height);
    let width = parseInt(style.width);

    for (let x = 0; x < videoBanners.length; x++) {
        if (height <= intViewportHeight) {
            videoBanners[x].classList.add("bannerHeight");
        }

        if (width < intViewportWidth) {
            videoBanners[x].classList.remove("bannerHeight");
        }
    }
}
