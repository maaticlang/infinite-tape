var OdometerTape = /** @class */ (function () {
    /**
     * Constructs a new InfiniteTape object.
     *
     * @param {string} parentElementId - The ID of the parent element where the tape will be appended.
     * @param {string} wrapperElementId - The ID of the wrapper element where the tape's content will be wrapped.
     * @param {Object} configuration - The configuration options for the InfiniteTape.
     */
    function OdometerTape(parentElementId, wrapperElementId, configuration) {
        this.STARTING_ELEMENTS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        this.MAX_DIFF = 200;
        this.FPS = 60;
        this.maxTopBaseValue = 5;
        this.fullJumpSize = 10;
        this.currentTransform = 0; // In units user provides
        this.currentValue = 0;
        this.translation = 0;
        this.intervalId = 0;
        this.tapeEl = null;
        this.wrapperEl = null;
        this.configuration = {
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
        this.currentValueEvent = new CustomEvent("odometerCurrentValue", {
            detail: {
                value: 0
            },
        });
        try {
            this.tapeEl = document.getElementById(parentElementId);
            this.wrapperEl = document.getElementById(wrapperElementId);
            if (configuration)
                this.prepareConfiguration(configuration);
            this.createStartList();
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * Prepares the configuration of the infinite tape.
     *
     * @param {TInfiniteTapeConfiguration} configuration - The configuration object for the infinite tape.
     * @return {void}
     */
    OdometerTape.prototype.prepareConfiguration = function (configuration) {
        // Adjust item height configuration
        if (configuration.itemHeight < 0)
            configuration.itemHeight = 0;
        // Adjust box configuration
        var maxItemHeight = configuration.itemHeight * 11;
        if (configuration.box.height < 0)
            configuration.box.height = 0;
        if (configuration.box.height > maxItemHeight)
            configuration.box.height = maxItemHeight;
        if (configuration.box.width < 0)
            configuration.box.width = 0;
        // Adjust time of translation configuration
        var minTimeOnTranslation = 250; // 250ms
        if (configuration.timeOfTranslation < minTimeOnTranslation)
            configuration.timeOfTranslation = minTimeOnTranslation;
        this.configuration = configuration;
        // Adjust other configuration
        this.fullJumpSize = this.configuration.itemHeight * 10;
        if (this.wrapperEl === null)
            throw new Error("Wrapper element is null");
        this.wrapperEl.style.fontSize = this.configuration.utils.textSize + "px";
    };
    /**
     * Creates the start list for the tape element.
     *
     * @throws {Error} If the wrapper element is null or the tape element is null.
     *
     * @return {void} Returns nothing.
     */
    OdometerTape.prototype.createStartList = function () {
        var _this = this;
        if (this.wrapperEl === null)
            throw new Error("Wrapper element is null");
        if (this.tapeEl === null)
            throw new Error("Tape element is null");
        this.tapeEl.style.display = "flex";
        this.tapeEl.style.flexDirection = "column";
        this.wrapperEl.style.height = this.configuration.box.height + this.configuration.utils.unit;
        this.wrapperEl.style.width = this.configuration.box.width + this.configuration.utils.unit;
        this.wrapperEl.style.overflow = "hidden";
        this.wrapperEl.style.display = "flex";
        this.wrapperEl.style.flexDirection = "column";
        this.wrapperEl.style.justifyContent = "center";
        this.STARTING_ELEMENTS.forEach(function (i) {
            var boxItemEl = document.createElement("div");
            boxItemEl.style.transform = "translateY(" + _this.currentTransform + _this.configuration.utils.unit + ")";
            boxItemEl.className = "box-item";
            boxItemEl.style.height = _this.configuration.itemHeight + _this.configuration.utils.unit;
            boxItemEl.style.width = "100%";
            boxItemEl.style.display = "flex";
            boxItemEl.style.justifyContent = "center";
            boxItemEl.style.alignItems = "center";
            boxItemEl.style.fontSize = "1" + _this.configuration.utils.unit;
            boxItemEl.textContent = (i).toString();
            _this.tapeEl.appendChild(boxItemEl);
        });
    };
    /**
     * Animates the tape infinitely by moving it in the specified direction and distance.
     *
     * @param {number} moveBy - The distance to move the tape.
     * @param {boolean} moveUp - Determines whether to move the tape up or down.
     * @param {boolean} isNegative - Determines whether to move the tape in the negative direction.
     * @throws {Error} - If tape element is null.
     * @returns {void}
     */
    OdometerTape.prototype.animateInfinite = function (moveBy, moveUp, isNegative) {
        if (this.tapeEl === null)
            throw new Error("Tape element is null");
        var multiplayer = moveUp ? -1 : 1;
        var secondaryMultiplier = isNegative ? -1 : 1;
        this.translation -= moveBy * multiplayer;
        this.currentValue -= moveBy / this.configuration.itemHeight * multiplayer * secondaryMultiplier;
        var limitValue = 5 * this.configuration.itemHeight;
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
    };
    /**
     * Animates the value to a given target value.
     *
     * @param {number} toValue - The target value to animate to.
     *
     * @return {void}
     */
    OdometerTape.prototype.animateTo = function (toValue) {
        var _this = this;
        clearInterval(this.intervalId);
        if (toValue < 0)
            toValue = 0;
        var overflowDigit = undefined;
        var iterations = 0; // Difference between numbers times num of frames
        var diff = Math.abs(toValue - this.currentValue);
        toValue = Number.parseFloat(toValue.toFixed(2));
        if (diff > this.MAX_DIFF) {
            overflowDigit = (toValue % 10);
            diff = this.MAX_DIFF;
        }
        var movePerFrame = diff * this.configuration.itemHeight / this.FPS;
        var moveUp = toValue >= this.currentValue;
        this.intervalId = setInterval(function () {
            if (_this.tapeEl === null)
                throw new Error("Tape element is null");
            // End of the iteration
            if (iterations >= _this.FPS) {
                clearInterval(_this.intervalId);
                _this.currentValue = Number.parseFloat(_this.currentValue.toFixed(2));
                if (overflowDigit !== undefined) {
                    _this.translation = overflowDigit * 2;
                    if (overflowDigit >= _this.maxTopBaseValue)
                        _this.translation -= _this.fullJumpSize;
                    _this.currentValue = Number.parseFloat(toValue.toFixed(2));
                    if (toValue < 0)
                        _this.currentValue *= -1;
                    _this.tapeEl.style.transform = "translateY(" + _this.translation + _this.configuration.utils.unit + ")";
                    overflowDigit = undefined;
                }
                _this.currentValueEvent.detail.value = _this.currentValue;
                document.dispatchEvent(_this.currentValueEvent);
                return;
            }
            _this.animateInfinite(movePerFrame, moveUp, toValue < 0);
            iterations++;
        }, this.configuration.timeOfTranslation / this.FPS);
    };
    return OdometerTape;
}());
export default OdometerTape;
