import {TInfiniteTapeConfiguration} from "./types";

class InfiniteTape {
    private STARTING_ELEMENTS: number[] = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9];
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

    private configuration: TInfiniteTapeConfiguration = {
        itemHeight: 2,
        utils: {
            textSize: 16,
            unit: 'rem',
        },
        timeOfTranslation: 500,
        incrementBy: 1,
    };

    private currentValueEvent: CustomEvent = new CustomEvent("infiniteTapeCurrentValue", {
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
    constructor(parentElementId: string, wrapperElementId: string, configuration: TInfiniteTapeConfiguration) {
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
     * Prepare the configuration of the infinite tape.
     * @param {TInfiniteTapeConfiguration} configuration - The configuration object for the infinite tape.
     * @return {void}
     */
    private prepareConfiguration(configuration: TInfiniteTapeConfiguration): void {
        // Adjust item height configuration
        if (configuration.itemHeight < 0) configuration.itemHeight = 0;

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
     */
    private createStartList(): void {
        if (this.wrapperEl === null) throw new Error("Wrapper element is null");
        if (this.tapeEl === null) throw new Error("Tape element is null");

        this.tapeEl.style.display = "flex";
        this.tapeEl.style.flexDirection = "column";

        // Calculates max height and sets it if it overflows from max value
        if (this.wrapperEl.clientHeight / this.configuration.utils.textSize > this.configuration.itemHeight * 9) {
            this.wrapperEl.style.height = this.configuration.itemHeight * 9 + this.configuration.utils.unit;
        }

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

            boxItemEl.textContent = (i * this.configuration.incrementBy).toString();

            this.tapeEl!.appendChild(boxItemEl);
        });
    }

    /**
     * Animates the tape infinitely by moving it in the specified direction and distance.
     *
     * @param moveBy - The distance to move the tape.
     * @param moveUp - Determines whether to move the tape up or down.
     * @param isNegative - Determines whether to move the tape in the negative direction.
     * @throws {Error} - If tape element is null.
     * @returns {void}
     */
    private animateInfinite(moveBy: number, moveUp: boolean, isNegative: boolean): void {
        if (this.tapeEl === null) throw new Error("Tape element is null");

        let multiplayer = moveUp ? -1 : 1;
        if (isNegative) multiplayer = -1;


        this.translation -= moveBy * multiplayer;
        this.currentValue -= moveBy / this.configuration.itemHeight * multiplayer;

        const limitValue = 5 * this.configuration.itemHeight;

        // Jumps to lower limit
        if (this.translation >= limitValue && moveUp) {
            this.translation += -this.fullJumpSize;
            this.calculateNextTapeState(moveUp);
        }

        // Jumps to upper limit
        if (this.translation <= -limitValue && !moveUp) {
            this.translation += this.fullJumpSize;
            this.calculateNextTapeState(moveUp);
        }

        // Make transformations on html elements
        this.tapeEl.style.transform = "translateY(" + this.translation + this.configuration.utils.unit + ")";

        this.currentValueEvent.detail.value = this.currentValue * this.configuration.incrementBy;
        document.dispatchEvent(this.currentValueEvent);
    }

    /**
     * Calculates the next state of the tape.
     * Moves the tape items up or down depending on the specified parameter.
     *
     * @param {boolean} moveUp - Specifies whether to move the tape items up or down.
     * @returns {void}
     */
    private calculateNextTapeState(moveUp: boolean): void {
        if (moveUp) {
            const movedFromItemEl = this.tapeEl!.children[4]; // Border item on the top
            const movedToItemEl = this.tapeEl!.children[14]; // Border item on the bottom
            movedToItemEl.textContent = movedFromItemEl.textContent;

            for (let i = 15; i < this.STARTING_ELEMENTS.length; i++) {
                const previousValue = Number.parseInt(this.tapeEl!.children[i - 1].textContent!);
                this.tapeEl!.children[i].textContent = (previousValue - this.configuration.incrementBy).toString();
            }

            for (let i = 13; i >= 0; i--) {
                const previousValue = Number.parseInt(this.tapeEl!.children[i + 1].textContent!);
                this.tapeEl!.children[i].textContent = (previousValue + this.configuration.incrementBy).toString();
            }

            return;
        }

        const movedFromItemEl = this.tapeEl!.children[14]; // Border item on the top
        const movedToItemEl = this.tapeEl!.children[4]; // Border item on the bottom
        movedToItemEl.textContent = movedFromItemEl.textContent;


        for (let i = 5; i < this.STARTING_ELEMENTS.length; i++) {
            const previousValue = Number.parseInt(this.tapeEl!.children[i - 1].textContent!);
            this.tapeEl!.children[i].textContent = (previousValue - this.configuration.incrementBy).toString();
        }

        for (let i = 3; i >= 0; i--) {
            const previousValue = Number.parseInt(this.tapeEl!.children[i + 1].textContent!);
            this.tapeEl!.children[i].textContent = (previousValue + this.configuration.incrementBy).toString();
        }
    }

    /**
     * Calculates the overflow state based on the given current value.
     *
     * @param {number} currentValue - The current value to calculate overflow state for.
     * @throws {Error} - If tape element is null.
     * @returns {void}
     */
    private calculateOverflowState(currentValue: number): void {
        if (this.tapeEl === null) throw new Error("Tape element is null");

        const roundedCurrentValue = Math.round(currentValue) * this.configuration.incrementBy;
        const position = roundedCurrentValue % 100 / 10;
        let index = 10 - position - 1;

        // Move to bottom
        if (index < this.maxTopBaseValue) index += (this.fullJumpSize / 2);

        this.tapeEl.children[index].textContent = roundedCurrentValue.toString()
        const startValue = roundedCurrentValue + index * this.configuration.incrementBy;

        this.STARTING_ELEMENTS.forEach((e, index) => {
            this.tapeEl!.children[index].textContent = (startValue - index * this.configuration.incrementBy).toString();
        })
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

        toValue /= this.configuration.incrementBy;

        let overflowDigit: undefined | number = undefined;
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
            if (this.tapeEl === null) throw new Error("Tape element is null");

            // End of the iteration
            if (iterations >= this.FPS) {
                clearInterval(this.intervalId);

                this.currentValue = Number.parseFloat(this.currentValue.toFixed(2));

                if (overflowDigit !== undefined) {
                    this.translation = overflowDigit * 2;

                    if (overflowDigit >= this.maxTopBaseValue) this.translation -= this.fullJumpSize;
                    this.currentValue = Number.parseFloat(toValue.toFixed(2));

                    this.tapeEl.style.transform = "translateY(" + this.translation + this.configuration.utils.unit + ")";

                    this.calculateOverflowState(this.currentValue);
                    overflowDigit = undefined;
                }

                this.currentValueEvent.detail.value = this.currentValue * this.configuration.incrementBy;
                document.dispatchEvent(this.currentValueEvent);
                return;
            }

            this.animateInfinite(movePerFrame, moveUp, toValue < 0);
            iterations++;
        }, this.configuration.timeOfTranslation / this.FPS);
    }
}

export default InfiniteTape;