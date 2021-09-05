let utcTimes = [
    [],
    [[1380, "The Nova Hellscape"]],
    [[1200, "Mainframe Of Atlas"]],
    [[1440, "Goblins Of Io"]],
    [[1380, "Spire Of Euclid"]],
    [[1380, "Shadow Of Asmodia"]],
    [[1200, "Miss Demeanor"]],
];

let carouselWidth = 0;
let dayWidth = 0;
let dayLength = 0;

//------------//------------//------------
//  1.2 Initialize Components
//------------//------------//------------

import * as schedule from "./schedule.js";
import * as countdown from "./countdown.js";

let scheduleElement = document.querySelector("#schedule-section");
let countdownElement = document.querySelector("#countdown-container");

let convertedWeek = schedule.convertWeek(utcTimes);
let scheduleHTML = schedule.createSchedule(convertedWeek);
let leftIcon = document.createElement("i");
leftIcon.classList.add("fas", "fa-angle-double-left");
let rightIcon = document.createElement("i");
rightIcon.classList.add("fas", "fa-angle-double-right");

let carouselHtml = scheduleHTML.querySelector(".schedule-carousel-days");
let leftBtn = scheduleHTML.querySelector("button:first-of-type");
leftBtn.appendChild(leftIcon);
leftBtn.addEventListener("click", () => carouselScroll(-1, carouselHtml));
let rightBtn = scheduleHTML.querySelector("button:last-of-type");
rightBtn.appendChild(rightIcon);
rightBtn.addEventListener("click", () => carouselScroll(1, carouselHtml));
scheduleElement.appendChild(scheduleHTML);

setNextShow();

function setNextShow() {
    let next = nextShow(convertedWeek);
    let showDay = next[0];
    let showTime = convertedWeek[showDay][next[1]][0];
    let showName = convertedWeek[showDay][next[1]][1];
    let daysTill = daysTillShow(showDay);

    let showNameFormatted = showName.replace(/\s/g, "");
    showNameFormatted = showNameFormatted.replace("'", "");
    showNameFormatted =
        showNameFormatted[0].toLowerCase() + showNameFormatted.substring(1);
    console.log(showNameFormatted);
    let showImg = countdownElement.querySelector("video");
    showImg.setAttribute("src", `./videos/${showNameFormatted}.mp4`);
    console.log(showImg);
    let countdownHTML = countdown.create(showTime, showName, daysTill);
    countdownElement
        .querySelector(".countdown-data")
        .appendChild(countdownHTML);

    let intervalID = window.setInterval(() => {
        if (countdown.data.finished) {
            document.querySelector("#countdown").remove();
            countdown.data.finished = false;
            clearInterval(intervalID);
            setNextShow();
        }
    }, 1000);
}

//------------//------------//------------
//  2.1 Next Show
//------------//------------//------------

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

const slider = document.querySelector(".schedule-carousel-days");
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("active");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    console.log("mouse down");
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
    console.log(slider.scrollLeft);
});

//carousel
function carouselScroll(value, htmlElement) {
    let curX = htmlElement.scrollLeft;
    console.log(`curX: ${curX}, dayLength: ${dayLength}`);
    let curShow = Math.floor(curX / dayLength);
    console.log(dayLength);
    let scrollValue = 0;
    if (curX % dayLength !== 0 && value === -1) {
        scrollValue = curShow * dayLength;
    } else {
        scrollValue = (curShow + value) * dayLength;
    }
    console.log(
        `scrollValue: ${scrollValue}, curShow:${curShow}, value: ${value}, dayLength:${dayLength}`
    );

    if (curX % dayLength !== 0) {
        // scrollValue += scrollValue + value * (curX % dayLength);
        // console.log(curX % dayLength);
    }

    htmlElement.scrollTo({ top: 0, left: scrollValue, behavior: "smooth" });
}

//
let videoBanners = document.querySelectorAll(".fullscreenAsset");
let navBarHeight = getComputedStyle(document.documentElement).getPropertyValue(
    "--navHeight"
);

navBarHeight = parseInt(navBarHeight);

// resize
function resizeFunctions() {
    videoBannerCheck();
    carouselCheck(carouselHtml);
}

function videoBannerCheck() {
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
    let scrollWidth = htmlElement.scrollWidth;
    carouselWidth = parseInt(scrollWidth);

    let shownWidth = getComputedStyle(htmlElement).getPropertyValue("width");
    shownWidth = parseInt(shownWidth);

    let dayElement = htmlElement.querySelector(".row");
    dayWidth = getComputedStyle(dayElement).getPropertyValue("width");
    dayWidth = parseInt(dayWidth);
    console.log(dayWidth);

    let totalDays = Math.floor(scrollWidth / dayWidth);
    let shownDays = Math.floor(shownWidth / dayWidth);
    console.log(totalDays);
    console.log(shownDays);

    // dayLength = (scrollWidth - shownWidth) / (totalDays - shownDays);
    // dayLength = Math.floor(dayLength);
    dayLength = shownWidth;
    // console.log(`${scrollWidth - shownWidth} days: ${totalDays - shownDays}`);
    // console.log(dayLength);
}

resizeFunctions();
window.addEventListener("resize", resizeFunctions);
