var InfiniteTape = /** @class */ (function () {
    /**
     * Constructs a new InfiniteTape object.
     *
     * @param {string} parentElementId - The ID of the parent element where the tape will be appended.
     * @param {string} wrapperElementId - The ID of the wrapper element where the tape's content will be wrapped.
     * @param {Object} configuration - The configuration options for the InfiniteTape.
     */
    function InfiniteTape(parentElementId, wrapperElementId, configuration) {
        this.STARTING_ELEMENTS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9];
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
            incrementBy: 1,
        };
        this.currentValueEvent = new CustomEvent("infiniteTapeCurrentValue", {
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
     * Prepare the configuration of the infinite tape.
     * @param {TInfiniteTapeConfiguration} configuration - The configuration object for the infinite tape.
     * @return {void}
     */
    InfiniteTape.prototype.prepareConfiguration = function (configuration) {
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
     */
    InfiniteTape.prototype.createStartList = function () {
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
            boxItemEl.textContent = (i * _this.configuration.incrementBy).toString();
            _this.tapeEl.appendChild(boxItemEl);
        });
    };
    /**
     * Animates the tape infinitely by moving it in the specified direction and distance.
     *
     * @param moveBy - The distance to move the tape.
     * @param moveUp - Determines whether to move the tape up or down.
     * @param isNegative - Determines whether to move the tape in the negative direction.
     * @throws {Error} - If tape element is null.
     * @returns {void}
     */
    InfiniteTape.prototype.animateInfinite = function (moveBy, moveUp, isNegative) {
        if (this.tapeEl === null)
            throw new Error("Tape element is null");
        var multiplayer = moveUp ? -1 : 1;
        if (isNegative)
            multiplayer = -1;
        this.translation -= moveBy * multiplayer;
        this.currentValue -= moveBy / this.configuration.itemHeight * multiplayer;
        var limitValue = 5 * this.configuration.itemHeight;
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
    };
    /**
     * Calculates the next state of the tape.
     * Moves the tape items up or down depending on the specified parameter.
     *
     * @param {boolean} moveUp - Specifies whether to move the tape items up or down.
     * @returns {void}
     */
    InfiniteTape.prototype.calculateNextTapeState = function (moveUp) {
        if (moveUp) {
            var movedFromItemEl_1 = this.tapeEl.children[4]; // Border item on the top
            var movedToItemEl_1 = this.tapeEl.children[14]; // Border item on the bottom
            movedToItemEl_1.textContent = movedFromItemEl_1.textContent;
            for (var i = 15; i < this.STARTING_ELEMENTS.length; i++) {
                var previousValue = Number.parseInt(this.tapeEl.children[i - 1].textContent);
                this.tapeEl.children[i].textContent = (previousValue - this.configuration.incrementBy).toString();
            }
            for (var i = 13; i >= 0; i--) {
                var previousValue = Number.parseInt(this.tapeEl.children[i + 1].textContent);
                this.tapeEl.children[i].textContent = (previousValue + this.configuration.incrementBy).toString();
            }
            return;
        }
        var movedFromItemEl = this.tapeEl.children[14]; // Border item on the top
        var movedToItemEl = this.tapeEl.children[4]; // Border item on the bottom
        movedToItemEl.textContent = movedFromItemEl.textContent;
        for (var i = 5; i < this.STARTING_ELEMENTS.length; i++) {
            var previousValue = Number.parseInt(this.tapeEl.children[i - 1].textContent);
            this.tapeEl.children[i].textContent = (previousValue - this.configuration.incrementBy).toString();
        }
        for (var i = 3; i >= 0; i--) {
            var previousValue = Number.parseInt(this.tapeEl.children[i + 1].textContent);
            this.tapeEl.children[i].textContent = (previousValue + this.configuration.incrementBy).toString();
        }
    };
    /**
     * Calculates the overflow state based on the given current value.
     *
     * @param {number} currentValue - The current value to calculate overflow state for.
     * @throws {Error} - If tape element is null.
     * @returns {void}
     */
    InfiniteTape.prototype.calculateOverflowState = function (currentValue) {
        var _this = this;
        if (this.tapeEl === null)
            throw new Error("Tape element is null");
        var roundedCurrentValue = Math.round(currentValue) * this.configuration.incrementBy;
        var position = roundedCurrentValue % 100 / 10;
        var index = 10 - position - 1;
        // Move to bottom
        if (index < this.maxTopBaseValue)
            index += (this.fullJumpSize / 2);
        this.tapeEl.children[index].textContent = roundedCurrentValue.toString();
        var startValue = roundedCurrentValue + index * this.configuration.incrementBy;
        this.STARTING_ELEMENTS.forEach(function (e, index) {
            _this.tapeEl.children[index].textContent = (startValue - index * _this.configuration.incrementBy).toString();
        });
    };
    /**
     * Animates the value to a given target value.
     *
     * @param {number} toValue - The target value to animate to.
     *
     * @return {void}
     */
    InfiniteTape.prototype.animateTo = function (toValue) {
        var _this = this;
        clearInterval(this.intervalId);
        toValue /= this.configuration.incrementBy;
        var overflowDigit = undefined;
        var iterations = 0; // Difference between numbers times num of frames
        var diff = Math.abs(toValue - this.currentValue);
        if (toValue < 0)
            diff *= -1;
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
                    _this.tapeEl.style.transform = "translateY(" + _this.translation + _this.configuration.utils.unit + ")";
                    _this.calculateOverflowState(_this.currentValue);
                    overflowDigit = undefined;
                }
                _this.currentValueEvent.detail.value = _this.currentValue * _this.configuration.incrementBy;
                document.dispatchEvent(_this.currentValueEvent);
                return;
            }
            _this.animateInfinite(movePerFrame, moveUp, toValue < 0);
            iterations++;
        }, this.configuration.timeOfTranslation / this.FPS);
    };
    return InfiniteTape;
}());
export default InfiniteTape;
