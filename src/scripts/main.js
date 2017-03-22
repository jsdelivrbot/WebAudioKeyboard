/// <reference path="./definitions/keypress.d.ts" />
var KeyboardController;
(function (KeyboardController) {
    class Keyboard {
        constructor() {
            this._CHORD_RELEASE_TIME = 150;
            this._keys_down = new Set("");
            this._keys_released = new Set("");
            this._chord = [];
            this._combos = [];
            this._eventElements = [];
            this._chordPressed = new Event("chordPressed");
            this._init();
        }
        _init() {
            this.listener = new keypress.Listener();
            this.listener.should_force_event_defaults = true;
            // Generate combos from controlKeys.ts
            this.generateCombos(KeyboardController.controlKeys);
            // Register combos with our keyboard listener
            this.listener.register_many(this._combos);
        }
        // Loop through the keys from controlKeys.ts and set up our combo array
        generateCombos(keys) {
            for (let key of keys) {
                this._combos.push({
                    keys: key,
                    on_keydown: () => {
                        return this.on_down(key);
                    },
                    on_keyup: () => {
                        return this.on_up(key);
                    }
                });
            }
        }
        // This function gets called whenever a key is down
        on_down(key) {
            if (!this._keys_down.has(key)) {
                this._keys_down.add(key);
            }
        }
        // This function gets called whenever a key goes up
        on_up(key) {
            if (this._keys_down.has(key)) {
                this._keys_down.delete(key);
                this.keyReleased(key);
            }
        }
        // When a key is released, we want to track that it was released;
        // If all other keys (if any) are also released before this._CHORD_RELEASE_TIME
        // is reached, then a chord is registered from all the released keys.
        // This also clears the tracker so that the other keys that were released don't
        // generate a new chord.
        //
        // If keys are still down when the timer expiores, the released key is
        // removed from our tracker.
        keyReleased(key) {
            this._keys_released.add(key);
            // if there are keys down, we cannot output a chord
            // if there are keys down and this is the first key released, start a timer
            // once the timer is done:
            // if the there are no keys down, set the chord
            // otherwise remove this key
            let promise = new Promise((resolve, reject) => {
                window.setTimeout(() => {
                    if (this.keys_down.length === 0 && this._keys_released.size !== 0) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }, this._CHORD_RELEASE_TIME);
            });
            promise.then((succeeded) => {
                if (succeeded) {
                    // console.log("success");
                    this.setChord(this._keys_released);
                    this._keys_released.clear();
                }
                else {
                    // console.log("failure");
                    this._keys_released.delete(key);
                }
            });
        }
        get chord() {
            return this._chord;
        }
        // Sets the chord and triggers the "chordPressed" event, which allows us
        // to trigger actions whenever a new chord is registered
        setChord(key_set) {
            this._chord = Array.from(key_set).sort();
            for (let element of this._eventElements) {
                element.dispatchEvent(this._chordPressed);
            }
        }
        get keys_down() {
            return Array.from(this._keys_down).sort();
        }
        // This function lets us pass in an HTMLElement and an EventListener
        // that we can apply the "chordPressed" event to.
        // We also store the HTMLElement so we can fire the event whenever a chord
        // is pressed.
        setChordEvent(element, callback) {
            element.addEventListener("chordPressed", callback, false);
            this._eventElements.push(element);
        }
    }
    KeyboardController.Keyboard = Keyboard;
})(KeyboardController || (KeyboardController = {}));
/// <reference path="./KeyboardController.ts" />
var KeyboardController;
(function (KeyboardController) {
    KeyboardController.controlKeys = [
        "backspace",
        "tab",
        "q",
        "w",
        "e",
        "r",
        "t",
        "y",
        "u",
        "i",
        "o",
        "p",
        "[",
        "]",
        "a",
        "s",
        "d",
        "f",
        "g",
        "h",
        "j",
        "k",
        "l",
        ";",
        "\'",
        "caps_lock",
        "enter",
        "shift",
        "z",
        "x",
        "c",
        "v",
        "b",
        "n",
        "m",
        ",",
        ".",
        "/",
        "ctrl",
        "alt",
        "cmd",
        "space",
    ];
})(KeyboardController || (KeyboardController = {}));
/// <reference path="./definitions/keypress.d.ts" />
/// <reference path="./definitions/timbre.d.ts" />
/// <reference path="./KeyboardController.ts" />
/// <reference path="./controlKeys.ts" />
let keys_down_node;
let chord_pressed_node;
let chord_callback;
let keyboard;
let audioContext;
keys_down_node = document.getElementById("keys_down");
chord_pressed_node = document.getElementById("chord_pressed");
chord_callback = (e) => {
    chord_pressed_node.innerHTML = "Chord Pressed: " + String(keyboard.chord.join(""));
};
keyboard = new KeyboardController.Keyboard();
keyboard.setChordEvent(chord_pressed_node, chord_callback);
document.addEventListener("keydown", function (e) {
    return keys_down_node.innerHTML = "Keys Down: " + String(keyboard.keys_down.join(""));
}, false);
document.addEventListener("keyup", function (e) {
    return keys_down_node.innerHTML = "Keys Down: " + String(keyboard.keys_down.join(""));
}, false);
