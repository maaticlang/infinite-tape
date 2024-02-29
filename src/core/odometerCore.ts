import {TOdometerConfiguration} from "./types";

class OdometerTape {
    private STARTING_ELEMENTS: number[] = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    private MAX_DIFF: number = 200;
    private FPS: number = 60;

    private maxTopBaseValue: number = 5;
    private fullJumpSize: number = 10;
    private currentTransform: number = 0; // In units user provides
    private currentValue: number = 0;
    private translation: number = 0;
    private intervalId: number = 0;

    private readonly tapeEl: HTMLElement | null = null;
    private readonly wrapperEl: HTMLElement | null = null;

    private configuration: TOdometerConfiguration = {
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
    };

    private currentValueEvent: CustomEvent = new CustomEvent("odometerCurrentValue", {
        detail: {
            value: 0
        },
    });

    /**
     * Constructs a new InfiniteTape object.
     *
     * @param {string} parentElementId - The ID of the parent element where the tape will be appended.
     * @param {string} wrapperElementId - The ID of the wrapper element where the tape's content will be wrapped.
     * @param {Object} configuration - The configuration options for the InfiniteTape.
     */
    constructor(parentElementId: string, wrapperElementId: string, configuration: TOdometerConfiguration) {
        try {
            this.tapeEl = document.getElementById(parentElementId);
            this.wrapperEl = document.getElementById(wrapperElementId);
            if (configuration) this.prepareConfiguration(configuration);

            this.createStartList();
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * Prepares the configuration of the infinite tape.
     *
     * @param {TInfiniteTapeConfiguration} configuration - The configuration object for the infinite tape.
     * @return {void}
     */
    private prepareConfiguration(configuration: TOdometerConfiguration): void {
        // Adjust item height configuration
        if (configuration.itemHeight < 0) configuration.itemHeight = 0;

        // Adjust box configuration
        const maxItemHeight = configuration.itemHeight * 11;
        if (configuration.box.height < 0) configuration.box.height = 0;
        if (configuration.box.height > maxItemHeight) configuration.box.height = maxItemHeight;
        if (configuration.box.width < 0) configuration.box.width = 0;

        // Adjust time of translation configuration
        const minTimeOnTranslation = 250; // 250ms
        if (configuration.timeOfTranslation < minTimeOnTranslation) configuration.timeOfTranslation = minTimeOnTranslation;

        this.configuration = configuration;

        // Adjust other configuration
        this.fullJumpSize = this.configuration.itemHeight * 10;

        if (this.wrapperEl === null) throw new Error("Wrapper element is null");
        this.wrapperEl.style.fontSize = this.configuration.utils.textSize + "px";
    }

    /**
     * Creates the start list for the tape element.
     *
     * @throws {Error} If the wrapper element is null or the tape element is null.
     *
     * @return {void} Returns nothing.
     */
    private createStartList(): void {
        if (this.wrapperEl === null) throw new Error("Wrapper element is null");
        if (this.tapeEl === null) throw new Error("Tape element is null");

        this.tapeEl.style.display = "flex";
        this.tapeEl.style.flexDirection = "column";

        this.wrapperEl.style.height = this.configuration.box.height + this.configuration.utils.unit;
        this.wrapperEl.style.width = this.configuration.box.width + this.configuration.utils.unit;
        this.wrapperEl.style.overflow = "hidden";
        this.wrapperEl.style.display = "flex";
        this.wrapperEl.style.flexDirection = "column";
        this.wrapperEl.style.justifyContent = "center";

        this.STARTING_ELEMENTS.forEach((i: number) => {
            const boxItemEl = document.createElement("div");
            boxItemEl.style.transform = "translateY(" + this.currentTransform + this.configuration.utils.unit + ")";
            boxItemEl.className = "box-item";

            boxItemEl.style.height = this.configuration.itemHeight + this.configuration.utils.unit;
            boxItemEl.style.width = "100%";
            boxItemEl.style.display = "flex";
            boxItemEl.style.justifyContent = "center";
            boxItemEl.style.alignItems = "center";
            boxItemEl.style.fontSize = "1" + this.configuration.utils.unit;

            boxItemEl.textContent = (i).toString();

            this.tapeEl!.appendChild(boxItemEl);
        });
    }

    /**
     * Animates the tape infinitely by moving it in the specified direction and distance.
     *
     * @param {number} moveBy - The distance to move the tape.
     * @param {boolean} moveUp - Determines whether to move the tape up or down.
     * @param {boolean} isNegative - Determines whether to move the tape in the negative direction.
     * @throws {Error} - If tape element is null.
     * @returns {void}
     */
    private animateInfinite(moveBy: number, moveUp: boolean, isNegative: boolean): void {
        if (this.tapeEl === null) throw new Error("Tape element is null");

        let multiplayer = moveUp ? -1 : 1;
        let secondaryMultiplier = isNegative ? -1 : 1;


        this.translation -= moveBy * multiplayer;
        this.currentValue -= moveBy / this.configuration.itemHeight * multiplayer * secondaryMultiplier;

        const limitValue = 5 * this.configuration.itemHeight;

        // Jumps to lower limit
        if (this.translation >= limitValue && moveUp) {
            this.translation += -this.fullJumpSize;
            // this.calculateNextTapeState(moveUp);
        }

        // Jumps to upper limit
        if (this.translation <= -limitValue && !moveUp) {
            this.translation += this.fullJumpSize;
            // this.calculateNextTapeState(moveUp);
        }

        // Make transformations on html elements
        this.tapeEl.style.transform = "translateY(" + this.translation + this.configuration.utils.unit + ")";

        this.currentValueEvent.detail.value = this.currentValue;
        document.dispatchEvent(this.currentValueEvent);
    }

    /**
     * Animates the value to a given target value.
     *
     * @param {number} toValue - The target value to animate to.
     *
     * @return {void}
     */
    public animateTo(toValue: number): void {
        clearInterval(this.intervalId);

        if (toValue < 0) toValue = 0;

        let overflowDigit: undefined | number = undefined;
        let iterations = 0; // Difference between numbers times num of frames

        let diff = Math.abs(toValue - this.currentValue);

        toValue = Number.parseFloat(toValue.toFixed(2));

        if (diff > this.MAX_DIFF) {
            overflowDigit = (toValue % 10);
            diff = this.MAX_DIFF;
        }

        const movePerFrame = diff * this.configuration.itemHeight / this.FPS;
        const moveUp = toValue >= this.currentValue;

        this.intervalId = setInterval(() => {
            if (this.tapeEl === null) throw new Error("Tape element is null");

            // End of the iteration
            if (iterations >= this.FPS) {
                clearInterval(this.intervalId);

                this.currentValue = Number.parseFloat(this.currentValue.toFixed(2));

                if (overflowDigit !== undefined) {
                    this.translation = overflowDigit * 2;

                    if (overflowDigit >= this.maxTopBaseValue) this.translation -= this.fullJumpSize;
                    this.currentValue = Number.parseFloat(toValue.toFixed(2));
                    if (toValue < 0) this.currentValue *= -1;

                    this.tapeEl.style.transform = "translateY(" + this.translation + this.configuration.utils.unit + ")";

                    overflowDigit = undefined;
                }

                this.currentValueEvent.detail.value = this.currentValue;
                document.dispatchEvent(this.currentValueEvent);
                return;
            }

            this.animateInfinite(movePerFrame, moveUp, toValue < 0);
            iterations++;
        }, this.configuration.timeOfTranslation / this.FPS);
    }
}

export default OdometerTape;