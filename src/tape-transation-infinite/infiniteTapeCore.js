class InfiniteTape {
    STARTING_ELEMENTS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10];
    MAX_DIFF = 200;
    FPS = 60;
    MAX_TOP_BASE_VALUE = 5;
    FULL_JUMP_SIZE = 20;

    currentTransform = -18; // In units user provides
    currentValue = 0;
    translation = 0;
    intervalId;

    tapeEl = null;
    wrapperEl = null;

    configuration = {
        itemHeight: 2,
        box: {
            height: 10,
            width: 2,
        },
        utils: {
            textSize: 16,
            unit: 'rem',
        },
        timeOfTranslation: 500,
        incrementBy: 1,
    };

    currentValueEvent = new CustomEvent("infiniteTapeCurrentValue", {
        detail: {
            value: 0
        },
    });

    constructor(parentElementId, wrapperElementId, configuration) {
        try {
            this.tapeEl = document.getElementById(parentElementId);
            this.wrapperEl = document.getElementById(wrapperElementId);
            if (configuration) this.#prepareConfiguration(configuration);

            this.#createStartList();
        } catch (e) {
            console.log(e)
        }
    }

    #prepareConfiguration(configuration) {
        if (configuration.itemHeight < 0) configuration.itemHeight = 0;

        const maxItemHeight = configuration.itemHeight * 11;
        if (configuration.box.height < 0) configuration.box.height = 0;
        if (configuration.box.height > maxItemHeight) configuration.box.height = maxItemHeight;
        if (configuration.box.width < 0) configuration.box.width = 0;

        const minTimeOnTranslation = 250; // 250ms
        if (configuration.timeOfTranslation < minTimeOnTranslation) configuration.timeOfTranslation = minTimeOnTranslation;

        if (configuration.utils.unit === "px") configuration.utils.unit = "em";

        this.configuration = configuration;

        this.wrapperEl.style.fontSize = this.configuration.utils.textSize + "px";
    }

    #createStartList() {
        this.tapeEl.style.display = "flex";
        this.tapeEl.style.flexDirection = "column";

        this.wrapperEl.style.height = this.configuration.box.height + this.configuration.utils.unit;
        this.wrapperEl.style.width = this.configuration.box.width + this.configuration.utils.unit;
        this.wrapperEl.style.overflow = "hidden";

        // Center the elements relative to the wrapper height
        const boxElHeight = this.wrapperEl.clientHeight / this.configuration.utils.textSize;
        this.currentTransform += (boxElHeight / 2) - 1;

        this.STARTING_ELEMENTS.forEach(i => {
            const boxItemEl = document.createElement("div");
            boxItemEl.style.transform = "translateY(" + this.currentTransform + this.configuration.utils.unit + ")";
            boxItemEl.className = "box-item";

            boxItemEl.style.height = this.configuration.itemHeight + this.configuration.utils.unit;
            boxItemEl.style.width = "100%";
            boxItemEl.style.display = "flex";
            boxItemEl.style.justifyContent = "center";
            boxItemEl.style.alignItems = "center";
            boxItemEl.style.fontSize = "1" + this.configuration.utils.unit;

            boxItemEl.textContent = (i * this.configuration.incrementBy).toString();

            this.tapeEl.appendChild(boxItemEl);
        });
    }

    #animateInfinite(moveBy, moveUp) {
        const multiplayer = -1; //!moveUp ? -1 : 1;

        this.translation -= moveBy * multiplayer;
        this.currentValue -= moveBy / 2 * multiplayer;

        // Jumps to lower limit
        if (this.translation >= 10 && moveUp) {
            this.translation += -this.FULL_JUMP_SIZE;
            this.#calculateNextTapeState(this.currentValue, moveUp);
        }

        // Jumps to upper limit
        if (this.translation <= -10 && !moveUp) {
            this.translation += this.FULL_JUMP_SIZE;
            this.#calculateNextTapeState(this.currentValue, moveUp);
        }

        // Make transformations on html elements
        this.tapeEl.style.transform = "translateY(" + this.translation + this.configuration.utils.unit + ")";

        this.currentValueEvent.detail.value = this.currentValue * this.configuration.incrementBy;
        document.dispatchEvent(this.currentValueEvent);
    }

    #calculateNextTapeState(currentValue, moveUp) {
        console.log(currentValue, moveUp)

        if (moveUp) {
            const movedFromItemEl = this.tapeEl.children[4]; // Border item on the top
            const movedToItemEl = this.tapeEl.children[14]; // Border item on the bottom
            movedToItemEl.textContent = movedFromItemEl.textContent;

            for (let i = 15; i < this.STARTING_ELEMENTS.length; i++) {
                const previousValue = Number.parseInt(this.tapeEl.children[i - 1].textContent);
                this.tapeEl.children[i].textContent = (previousValue - this.configuration.incrementBy).toString();
            }

            for (let i = 13; i >= 0; i--) {
                const previousValue = Number.parseInt(this.tapeEl.children[i + 1].textContent);
                this.tapeEl.children[i].textContent = (previousValue + this.configuration.incrementBy).toString();
            }

            return;
        }

        const movedFromItemEl = this.tapeEl.children[14]; // Border item on the top
        const movedToItemEl = this.tapeEl.children[4]; // Border item on the bottom
        movedToItemEl.textContent = movedFromItemEl.textContent;

        for (let i = 5; i < this.STARTING_ELEMENTS.length; i++) {
            const previousValue = Number.parseInt(this.tapeEl.children[i - 1].textContent);
            this.tapeEl.children[i].textContent = (previousValue - this.configuration.incrementBy).toString();
        }

        for (let i = 3; i >= 0; i--) {
            const previousValue = Number.parseInt(this.tapeEl.children[i + 1].textContent);
            this.tapeEl.children[i].textContent = (previousValue + this.configuration.incrementBy).toString();
        }
    }

    #calculateOverflowState(currentValue) {
        const roundedCurrentValue = Math.round(currentValue) * this.configuration.incrementBy;
        const position = roundedCurrentValue % 100 / 10;
        let index = 10 - position - 1;

        // Move to bottom
        if (index < this.MAX_TOP_BASE_VALUE) index += (this.FULL_JUMP_SIZE / 2);

        this.tapeEl.children[index].textContent = roundedCurrentValue.toString()
        const startValue = roundedCurrentValue + index * this.configuration.incrementBy;

        this.STARTING_ELEMENTS.forEach((e, index) => {
            this.tapeEl.children[index].textContent = (startValue - index * this.configuration.incrementBy).toString();
        })
    }

    animateTo(toValue) {
        clearInterval(this.intervalId);

        toValue = Number.parseFloat(toValue) / this.configuration.incrementBy;

        let overflowDigit = undefined;
        let iterations = 0; // Difference between numbers times num of frames

        let diff = Math.abs(toValue - this.currentValue);

        if (toValue < 0) diff *= -1;

        toValue = Number.parseFloat(toValue.toFixed(2));

        if (diff > this.MAX_DIFF) {
            overflowDigit = (toValue % 10);
            diff = this.MAX_DIFF;
        }

        const movePerFrame = diff * this.configuration.itemHeight / this.FPS;
        const moveUp = toValue >= this.currentValue;

        this.intervalId = setInterval(() => {
            // End of the iteration
            if (iterations >= this.FPS) {
                clearInterval(this.intervalId);

                this.currentValue = Number.parseFloat(this.currentValue.toFixed(2));

                if (overflowDigit !== undefined) {
                    this.translation = overflowDigit * 2;

                    if (overflowDigit >= this.MAX_TOP_BASE_VALUE) this.translation -= this.FULL_JUMP_SIZE;
                    this.currentValue = Number.parseFloat(toValue.toFixed(2));

                    this.tapeEl.style.transform = "translateY(" + this.translation + this.configuration.utils.unit + ")";

                    this.#calculateOverflowState(this.currentValue);
                    overflowDigit = undefined;
                }

                this.currentValueEvent.detail.value = this.currentValue * this.configuration.incrementBy;
                document.dispatchEvent(this.currentValueEvent);
                return;
            }

            this.#animateInfinite(movePerFrame, moveUp);
            iterations++;
        }, this.configuration.timeOfTranslation / this.FPS);
    }
}

export default InfiniteTape;