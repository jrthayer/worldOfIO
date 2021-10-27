//------------//------------//------------//------------//------------
//      TABLE OF CONTENTS
//------------//------------//------------//------------//------------
//      0. Global Values
//          0.1 Initialize
//      1. Features
//          1.1 Schedule
//          1.2 Countdown
//             1.2a Next Show
//          1.3 Carousel
//          1.4 Resize
//------------//------------//------------//------------//------------

//------------//------------//------------//------------
//      0. Global Values
//------------//------------//------------//------------
import * as schedule from "./schedule.js";
import * as countdown from "./countdown.js";

// Schedule in utc
let utcTimes = [
    [],
    [],
    [],
    [[1440, "Goblins Of IO"]],
    [[1380, "Spire Of Euclid"]],
    [[1260, "The Altered Ballad"]],
    [[1200, "Miss Demeanor"]],
];

// Carousel Dimensions
let carouselWidth = 0;
let dayWidth = 0;
let shownDays = 0;
let totalDays = 0;

//------------//------------//------------
//  0.1 Initialize
//------------//------------//------------
// Schedule
let convertedWeek = schedule.convertWeek(utcTimes);
let scheduleElement = document.querySelector("#schedule-section");
let scheduleHTML = schedule.createSchedule(convertedWeek);
scheduleElement.appendChild(scheduleHTML);

// Countdown
let countdownElement = document.querySelector("#countdown-container");
setNextShow(convertedWeek);

//Carousel
let carouselHtml = scheduleHTML.querySelector(".schedule-carousel-days");

checkBounds();

let timer = null;
carouselHtml.addEventListener(
    "scroll",
    function () {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            checkBounds();
        }, 150);
    },
    false
);

// Resize
resized(carouselHtml);

window.addEventListener("resize", () => {
    resized(carouselHtml);
});

//------------//------------//------------//------------
//      1. Features
//------------//------------//------------//------------

//------------//------------//------------
//  1.1 Schedule
//------------//------------//------------

//Add Fontawesome Icons to buttons
let leftIcon = document.createElement("i");
leftIcon.classList.add("fas", "fa-angle-double-left");
let rightIcon = document.createElement("i");
rightIcon.classList.add("fas", "fa-angle-double-right");

let leftBtn = scheduleHTML.querySelector("button:first-of-type");
leftBtn.appendChild(leftIcon);
leftBtn.addEventListener("click", () => carouselScroll(-1, carouselHtml));

let rightBtn = scheduleHTML.querySelector("button:last-of-type");
rightBtn.appendChild(rightIcon);
rightBtn.addEventListener("click", () => carouselScroll(1, carouselHtml));

//------------//------------//------------
//  1.2 Countdown
//------------//------------//------------
function setNextShow(weekData) {
    let next = nextShow(weekData);
    let showDay = next[0];
    let showTime = weekData[showDay][next[1]][0];
    let showName = weekData[showDay][next[1]][1];
    let daysTill = daysTillShow(showDay);

    //One Show Edge Case
    if (daysTill === 0) {
        let time = new Date();
        let minutes = time.getMinutes() + time.getHours() * 60;
        if (minutes > showTime) {
            daysTill = 7;
        }
    }

    let showNameFormatted = showName.replace(/\s/g, "");
    showNameFormatted = showNameFormatted.replace("'", "");
    showNameFormatted =
        showNameFormatted[0].toLowerCase() + showNameFormatted.substring(1);

    let showImg = countdownElement.querySelector("video");
    showImg.setAttribute("src", `./videos/${showNameFormatted}.mp4`);
    showImg.setAttribute("poster", `./images/${showNameFormatted}.png`);

    let countdownHTML = countdown.create(showTime, showName, daysTill);
    countdownElement
        .querySelector(".countdown-data")
        .appendChild(countdownHTML);

    let intervalID = window.setInterval(() => {
        if (countdown.data.finished) {
            document.querySelector("#countdown").remove();
            countdown.data.finished = false;
            clearInterval(intervalID);
            setNextShow(weekData);
        }
    }, 1000);
}

//------------//------------
//  1.2a Next Show
//------------//------------

//Info: determines the next show on the schedule
//------------
//Return:
//  +an array with:
//      +index 0: int value of the day of the show;
//      +index 1: index of show that day;
function nextShow(schedule) {
    let time = new Date();
    let day = time.getDay();
    let minutes = time.getMinutes() + time.getHours() * 60;

    let loopNum = 0;
    let showDay = 0;
    let showInstance = 0;
    let found = false;

    while (found !== true) {
        let curDay = day + loopNum;
        //accounts for being greater than sun === 6
        if (curDay > 6) curDay = curDay - 7;

        //have to check all shows of current day
        if (loopNum === 0) {
            for (let x = 0; x < schedule[curDay].length; x++) {
                //+1 ensures that next show runs at 0
                if (minutes + 1 < schedule[curDay][x][0]) {
                    showDay = curDay;
                    showInstance = x;

                    found = true;
                    break;
                }
            }
        } else {
            //if next show is on another day it will be the first show of that day
            if (schedule[curDay].length > 0) {
                showDay = curDay;
                showInstance = 0;

                found = true;
                break;
            }
        }

        loopNum++;
        if (loopNum >= 7) break;
    }

    //found no shows, only happens when there is only one show and it already occured today
    if (found === false) {
        showDay = day;
        showInstance = 0;
    }

    return [showDay, showInstance];
}

//Info: determines days till weekly event
//------------
//Parameters:
//  +eventDay: day of the event
//------------
//Return:
//  +an int that is the days till the event
function daysTillShow(eventDay) {
    let date = new Date();
    let curDay = date.getDay();

    // days between now and next show
    let daysBetween = 0;
    if (curDay > eventDay) {
        daysBetween = 7 - curDay + eventDay;
    } else {
        daysBetween = eventDay - curDay;
    }

    return daysBetween;
}

//------------//------------//------------
//  1.3 Resize
//------------//------------//------------
function resized(carouselHtml) {
    videoBannerCheck();
    carouselCheck(carouselHtml);
}

function videoBannerCheck() {
    let videoBanners = document.querySelectorAll(".fullscreenAsset");

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

function carouselCheck(htmlElement) {
    carouselWidth = getComputedStyle(htmlElement).getPropertyValue("width");
    carouselWidth = parseInt(carouselWidth);

    //individual day dimensions
    let dayElement = htmlElement.querySelector(".row");
    dayWidth = getComputedStyle(dayElement).getPropertyValue("width");
    dayWidth = parseInt(dayWidth);

    //days on schedule calc
    let scrollWidth = htmlElement.scrollWidth;
    totalDays = Math.floor(scrollWidth / dayWidth);
    shownDays = Math.floor(carouselWidth / dayWidth);
    // console.log(
    //     `scrollWidth: ${scrollWidth}, dayWidth: ${dayWidth}, carouselWidth: ${carouselWidth}`
    // );
    // console.log(`totalDays: ${totalDays}, shownDays: ${shownDays}`);
}

//------------//------------//------------
//  1.4 Carousel
//------------//------------//------------

//carousel drag feature
const slider = document.querySelector(".schedule-carousel-days");
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("active");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});
slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("active");
});
slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("active");
});
slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = x - startX;
    slider.scrollLeft = scrollLeft - walk;
    //Check bounds
    checkBounds();
});

//carousel buttons feature
// Current Bug: only scrolls one show back when clicking on left button(<<) on last page, mitigated by > 5 in first if statement
function carouselScroll(value, htmlElement) {
    let curX = htmlElement.scrollLeft;

    let curPage = Math.floor(curX / carouselWidth);
    let curShow = 0;
    // console.log(`curPageBefore: ${curPage}`);
    if (curX % carouselWidth > 5 && value === -1) {
        curPage = Math.floor(curX / carouselWidth);
    } else {
        curPage = Math.floor(curX / carouselWidth) + value;
    }

    if (curPage > totalDays) {
        curPage = totalDays;
    }

    if (curPage < 0) {
        curPage = 0;
    }

    curShow = curPage * shownDays + shownDays;

    // if (value === -1) {
    //     curShow = curPage * shownDays + 1;
    // } else {
    //     curShow = curPage * shownDays + shownDays;
    // }

    if (curShow < 1) {
        curShow = 1;
    }

    if (curShow >= totalDays) {
        curShow = totalDays;
    }

    let showElement = htmlElement.querySelector(`.row:nth-of-type(${curShow})`);
    showElement.scrollIntoView({ behavior: "smooth", inline: "end" });
    // console.log(
    //     `curShow: ${curShow}, curPageAfter: ${curPage}, curX: ${curX}, caroWidth: ${carouselWidth}, mod: ${
    //         curX % carouselWidth
    //     }`
    // );
    checkBounds();
    //Check bounds
}

function checkBounds() {
    const slider = document.querySelector(".schedule-carousel-days");
    let carouselHtml = scheduleHTML.querySelector(".schedule-carousel-days");
    let scrollEnd = carouselHtml.scrollWidth - carouselHtml.clientWidth;

    let buttons = document.querySelectorAll("button");
    for (let x = 0; x < buttons.length; x++) {
        buttons[x].classList.remove("hidden");
    }

    if (slider.scrollLeft === 0) {
        buttons[0].classList.add("hidden");
    }

    // console.log(`left: ${slider.scrollLeft}, width: ${scrollEnd}`);

    if (slider.scrollLeft === scrollEnd) {
        buttons[1].classList.add("hidden");
    }
}
