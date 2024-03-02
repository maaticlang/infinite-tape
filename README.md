# :infinity: Infinite Tape

## 👋 Introduction

The Infinite Tape module represents a virtual tape, which can theoretically animate to infinity. 

On the other hand, the Odometer Tape module is designed to represent values in a way similar to the mechanical odometer device. It provides efficient digit management and rolling animation capabilities. :recycle: 

![Infinite Tape](/assets/infinite-tape.png)

**Example page** can be accesed with this [link](https://maaticlang.github.io/infinite-tape/).

## :wrench: Custom Software Development and Consulting

If you find this project helpful and need assistance with a custom job, or if you require a more tailored solution for your specific use case, I would be glad to help!
I offer consulting and software development services in TypeScript, JavaScript, and a variety of other technologies. Here's what you can expect:

- :gear: Developing complex, robust, and secure software applications
- :hammer_and_wrench: Customizing and optimizing existing code
- 📖 Professional consulting and advice tailored to your needs
- :stars: And much more!

Contact me at:
- [Linkedin](https://www.linkedin.com/in/matic-lang-54ab27240/)

## :blue_heart: Support the Project

If you find this project useful and want to show some appreciation, consider supporting me:

<a target="_blank" rel="noopener noreferrer" href="https://www.paypal.com/donate/?hosted_button_id=FCQWFWXQY6RCY"><img src="/assets/paypal-donate.png" alt="Image description" width="150"></a>

Your support helps me maintain and improve this project. Thank you!

## :cd: Installation

Using npm:

```
npm i -g npm
npm i --save infinite-tape
```

## :hammer_and_wrench: Usage

### ♾️ Infinite Tape

1. Infinite Tape is imported directly from package root path.

```
import {InfiniteTape} from "infinite-tape";
```

2. Create a configuration object for the InfiniteTape class. All units are connected to the `utils.unit` unit.

```
const infiniteTapeConfiguration = {
        itemHeight: 2,
        utils: {
            unit: 'rem', // rem | em
            textSize: 16, // px
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

6. Add two `div` elements with desired ids, which need to be passed to class constructor. You must set `width` and `height` to the outer div. Note that `height` is limited to `9 * height of one box item`, if you use height measures such as `%, vh` be careful because the inner tape can overflow. If height does not exceed the limited value you can use `%, vh` with ease.

```
<div id="infiniteTapeBox">
    <div id="infiniteTapeTape"></div>
</div>
```

### 0️⃣ Odometer

Odometer currently does not support negative values.

1. Odometer is imported directly from package root path.

```
import {OdometerTape} from "infinite-tape";
```

2. Create a configuration object for the InfiniteTape class. All units are connected to the `utils.unit` unit.

```
const odometerConfiguration = {
        itemHeight: 2,
        utils: {
            unit: 'rem', // rem | em
            textSize: 16, // px
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

6. Add two `div` elements with desired ids, which need to be passed to class constructor. You must set `width` and `height` to the outer div. Note that `height` is limited to `9 * height of one box item`, if you use height measures such as `%, vh` be careful because the inner tape can overflow. If height does not exceed the limited value you can use `%, vh` with ease.

```
<div id="odometerTapeBox">
    <div id="odometerTapeTape"></div>
</div>
```

## 🎨 Styling

Styling the elements is achieved with overriding css ids and classes. There are 3 major elements to override:
- **box**
- **tape**
- **tape item** can be overwritten with class `box-item`

The first two elements are overwritten with your desired ids which you had to set at initialization of the elements.
