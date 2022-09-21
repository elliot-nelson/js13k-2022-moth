// TouchAdapter

import { INPUT_MODE_TOUCH } from '../Constants';
import { Input } from './Input';
import { Viewport } from '../Viewport';
import { Audio } from '../Audio';
import { game } from '../Game';

export const TouchAdapter = {
    init() {
        this.map = [];
        this.map[0] = Input.Action.RAW_TOUCH;

        this.held = [];

        window.addEventListener('touchmove', event => {
            if (!this.pointer) this.pointer = {};
            let p = event.changedTouches[0];
            this.pointer.u = ((p.clientX * Viewport.width) / Viewport.clientWidth) | 0;
            this.pointer.v = ((p.clientY * Viewport.height) / Viewport.clientHeight) | 0;
            Input.mode = INPUT_MODE_TOUCH;
        });

        window.addEventListener('touchstart', event => {
            let k = this.map[0];
            if (k) this.held[k] = true;

            // Hack to ensure we initialize audio after user interacts with game
            Audio.markReady();
            Input.mode = INPUT_MODE_TOUCH;

            let p = event.changedTouches[0];
            this.pointerDragStart = {
                u: ((p.clientX * Viewport.width) / Viewport.clientWidth) | 0,
                v: ((p.clientY * Viewport.height) / Viewport.clientHeight) | 0
            };
            this.pointer = { ...this.pointerDragStart };
        });

        window.addEventListener('touchend', event => {
            let k = this.map[0];
            if (k) this.held[k] = false;
            game.frogger = 'TOUCHEND';
            Input.mode = INPUT_MODE_TOUCH;
        });

        this.reset();
    },

    update() {
    },

    reset() {
        this.pointer = undefined;
        for (let action of Object.values(Input.Action)) {
            this.held[action] = false;
        }
    }
};
