# Infinite Tape

## Introduction

The Infinite Tape module represents a virtual tape, which can theoretically animate to infinity. 

On the other hand, the Odometer Tape module is designed to represent values in a way similar to the mechanical odometer device. It provides efficient digit management and rolling animation capabilities.

## Custom Software Development and Consulting

If you find this project helpful and need assistance with a custom job, or if you require a more tailored solution for your specific use case, I would be glad to help!

I offer consulting and software development services in TypeScript, JavaScript, and a variety of other technologies. Here's what you can expect:

- Developing complex, robust, and secure software applications
- Customizing and optimizing existing code
- Professional consulting and advice tailored to your needs
- And much more!

[Linkedin](https://www.linkedin.com/in/matic-lang-54ab27240/)
[GitHub](https://github.com/maaticlang/infinite-tape)

## Installation

Using npm:

```
npm i -g npm
npm i --save infinite-tape
```

## Usage

### Infinite Tape

1. Infinite Tape is imported directly from package root path.

```
import {InfiniteTape} from "infinite-tape";
```

2. Create a configuration object for the InfiniteTape class. All units are connected to the `utils.unit` unit.

```
const infiniteTapeConfiguration = {
        itemHeight: 2,
        utils: {
            unit: 'rem',
            textSize: 20, // px
        },
        box: {
            height: 10,
            width: 3,
        },
        timeOfTranslation: 1000, // ms
        incrementBy: 10,
    }
```

3. Create a new object from `InfiniteTape(tapeId, wrapperId, configuration)` class.

```
const infiniteTape = new InfiniteTape("infiniteTapeTape", "infiniteTapeBox", infiniteTapeConfiguration);
```

4. Animate the tape to the new value.

```
infiniteTape.animateTo(45);
```

5. Infinite Tape has a custom event `infiniteTapeCurrentValue`. You can listen to changes with:

```
document.addEventListener("infiniteTapeCurrentValue", (e) => {
        console.log(e.detail.value);
    });
```

6. Add two `div` elements with desired ids, which need to be passed to class constructor.

```
<div id="infiniteTapeBox">
    <div id="infiniteTapeTape"></div>
</div>
```

### Odometer

1. Odometer is imported directly from package root path.

```
import {OdometerTape} from "infinite-tape";
```

2. Create a configuration object for the InfiniteTape class. All units are connected to the `utils.unit` unit.

```
const odometerConfiguration = {
        itemHeight: 2,
        utils: {
            unit: 'rem',
            textSize: 20, // px
        },
        box: {
            height: 10,
            width: 3,
        },
        timeOfTranslation: 1000, // ms
    }
```

3. Create a new object from `OdometerTape(tapeId, wrapperId, configuration)` class.

```
const odometerTape = new OdometerTape("odometerTapeTape", "odometerTapeBox", odometerConfiguration);
```

4. Animate the tape to the new value.

```
odometerTape.animateTo(9);
```

5. Odometer has a custom event `odometerCurrentValue`. You can listen to changes with:

```
document.addEventListener("odometerCurrentValue", (e) => {
        console.log(e.detail.value);
    });
```

6. Add two `div` elements with desired ids, which need to be passed to class constructor.

```
<div id="odometerTapeBox">
    <div id="odometerTapeTape"></div>
</div>
```