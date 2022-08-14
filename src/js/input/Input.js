'use strict';

import { KeyboardAdapter } from './KeyboardAdapter';
import { MouseAdapter } from './MouseAdapter';

//import { GamepadAdapter } from './GamepadAdapter';
//import { NormalVector } from './Geometry';

/**
 * This is our abstract game input handler.
 *
 * Each frame, we'll collect input data from all of our supported input adapters,
 * and turn it into game input. This game input can then be used by the game
 * update for the frame.
 *
 * The input adapters give us data like "key X pressed", or "right mouse button
 * clicked", or "button B" pressed, and these are translated into a game input
 * like "dodge".
 */
export const Input = {
    // Game Inputs
    //
    // Note that moving the player around is actually not considered an action; it's
    // a separate non-action input called "direction". It just so happens that on
    // keyboard, for example, pressing the "down arrow" key is considered both a
    // press of the in-game DOWN action and a directional input. It's up to the input
    // consumer to decide which input is relevant (if any). For example, on a menu,
    // we may consume the DOWN/UP actions to navigate the menu, but ignore directional
    // inputs.
    //
    Action: {
        UP: 11,
        DOWN: 12,
        LEFT: 13,
        RIGHT: 14,
        ATTACK: 21,
        RELOAD: 30,
        MENU: 96,
        MUTE: 97,
        FREEZE: 98
    },

    init() {
        // A vector representing the direction the user is pressing/facing,
        // separate from pressing and releasing inputs. Treating "direction"
        // separately makes it easier to handle gamepad sticks.
        this.direction = { x: 0, y: 0, m: 0 };

        // "Pressed" means an input was pressed THIS FRAME.
        this.pressed = {};

        // "Released" means an input was released THIS FRAME.
        this.released = {};

        // "Held" means an input is held down. The input was "Pressed" either
        // this frame or in a past frame, and has not been "Released" yet.
        this.held = {};

        // How many frames was this input held down by the player. If [held]
        // is false, it represents how long the input was last held down.
        this.framesHeld = {};

        KeyboardAdapter.init();
        MouseAdapter.init();
        //GamepadAdapter.init();
    },

    update() {
        // We could have some kind of "input adapter toggle", but it's easier to just treat all inputs
        // as valid -- if you're pressing the "attack" button on either gamepad or keyboard, then you're
        // attacking. For directional input, we instead check whether there's movement on the thumbstick,
        // and we use it if there is -- otherwise we try to extract movement from the keyboard instead.

        KeyboardAdapter.update();
        MouseAdapter.update();
        //GamepadAdapter.update();

        for (let action of Object.values(Input.Action)) {
            let held = MouseAdapter.held[action] || KeyboardAdapter.held[action];
            //let held = GamepadAdapter.held[action] || KeyboardAdapter.held[action];
            this.pressed[action] = !this.held[action] && held;
            this.released[action] = this.held[action] && !held;

            if (this.pressed[action]) {
                this.framesHeld[action] = 1;
            } else if (this.held[action] && held) {
                this.framesHeld[action]++;
            }

            this.held[action] = held;
        }

        this.pointer = MouseAdapter.pointer;
        this.direction = KeyboardAdapter.direction;
        //this.direction = this.gamepad.direction.m > 0 ? this.gamepad.direction : this.keyboard.direction;
    },

    onDown(action) {},
    onUp(action) {},
};
