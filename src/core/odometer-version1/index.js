const tapeEl = document.getElementById("tape");

const elements = [4, 3, 2, 1, 0, 9, 8, 7, 6, 5]
const oneItemHeight = 2; // 2rem
const fps = 60;

let currentTransform = -4; // -4rem is ground zero
let currentValue = 0;

let intervalId;

function createStartList() {
    elements.forEach(i => {
        const boxItemEl = document.createElement("div");
        boxItemEl.style.transform = "translateY(" + currentTransform + "rem)";
        boxItemEl.className = "box-item";

        const boxItemTextEl = document.createElement("div");
        boxItemEl.textContent = (i).toString();
        boxItemEl.appendChild(boxItemTextEl);

        tapeEl.appendChild(boxItemEl);
    });
}

let translation = 0;
// const numberOfInteractionsBeforeReplace = 20;
let numberOfIterations = 0;

function animateInfinite(numberOfInteractionsBeforeReplace, moveBy, moveUp) {
    const multiplayer = moveUp ? -1 : 1;
    numberOfIterations++;

    // Add on move up
    if (numberOfInteractionsBeforeReplace === numberOfIterations && moveUp) {
        console.log("item moved")

        numberOfIterations = 0;

        const replaceEl = tapeEl.children[tapeEl.children.length - 1];
        const beforeEl = tapeEl.children[0];
        tapeEl.removeChild(replaceEl);
        tapeEl.insertBefore(replaceEl, beforeEl);

        translation -= 2;

        // Add on move down
    } else if (numberOfInteractionsBeforeReplace === numberOfIterations && !moveUp) {
        numberOfIterations = 0;

        const replaceEl = tapeEl.children[0];
        tapeEl.removeChild(replaceEl);
        tapeEl.appendChild(replaceEl);

        translation += 2;
    }

    translation -= moveBy * multiplayer;

    currentValue -= moveBy / 2 * multiplayer;

    tapeEl.style.transform = "translateY(" + translation + "rem)";

    document.getElementById("currentValue").textContent = "Current value: " + currentValue.toFixed(2);
    document.getElementById("currentTranslation").textContent = "Current translation: " + translation.toFixed(2);
}

function animateTo(toValue) {
    // Difference between numbers times num of frames
    const numberOfIterations = Math.abs(toValue + currentValue) * fps;
    const numberOfIterationsInOneMove = Math.abs(toValue + currentValue) / fps;
    const moveByFrame = (toValue / fps) / 2;
    let iterations = 0;

    const iterationsPerSecond = 1000 / Math.abs(toValue + currentValue);

    console.log("--- animate to ---");
    console.log("numberOfIterations", numberOfIterations);
    console.log("numberOfIterationsInOneMove", numberOfIterationsInOneMove);
    console.log("moveByFrame", moveByFrame);
    console.log("--- ---");

    const move = Math.abs(toValue + currentValue) / 60;

    const moveUp = toValue >= currentValue || toValue < 0;

    intervalId = setInterval(() => {
        if (iterations >= numberOfIterations) {
            clearInterval(intervalId);
            currentValue = Math.round(currentValue);

            document.getElementById("currentValue").textContent = "Current value: " + currentValue;

            console.log("reset interval", currentValue)
            console.log("iterations", iterations)
            return;
        }

        animateInfinite(60, 2 / 60, moveUp);
        iterations++;
    }, 200 / 60)
}

createStartList();
// animateTo(2)