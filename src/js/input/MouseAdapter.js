// MouseAdapter

import { INPUT_MODE_MOUSE } from '../Constants';
import { Input } from './Input';
import { Viewport } from '../Viewport';
import { Audio } from '../Audio';
import { game } from '../Game';

export const MouseAdapter = {
    init() {
        this.map = [];
        this.map[0] = Input.Action.RAW_TOUCH; // LMB
        this.map[2] = Input.Action.RELOAD; // RMB

        this.held = [];

        window.addEventListener('mousemove', event => {
            if (!this.pointer) this.pointer = {};
            this.pointer.u = ((event.clientX * Viewport.width) / Viewport.clientWidth) | 0;
            this.pointer.v = ((event.clientY * Viewport.height) / Viewport.clientHeight) | 0;
            Input.mode = INPUT_MODE_MOUSE;
        });

        window.addEventListener('mouseout', () => {
            this.pointer = undefined;
        });

        window.addEventListener('mousedown', event => {
            let k = this.map[event.button];
            if (k) this.held[k] = true;

            // Hack to ensure we initialize audio after user interacts with game
            Audio.markReady();
            Input.mode = INPUT_MODE_MOUSE;

            this.pointerDragStart = {
                u: ((event.clientX * Viewport.width) / Viewport.clientWidth) | 0,
                v: ((event.clientY * Viewport.height) / Viewport.clientHeight) | 0
            };
        });

        window.addEventListener('mouseup', event => {
            let k = this.map[event.button];
            if (k) this.held[k] = false;
            Input.mode = INPUT_MODE_MOUSE;
        });

        window.addEventListener('click', event => {
            event.preventDefault();
            game.frogger = 'click';
        });

        window.addEventListener('contextmenu', event => {
            let k = this.map[event.button];
            if (k) this.held[k] = true;
            this.releaseRMBTick = 2;
            event.preventDefault();
        });

        MouseAdapter.reset();
    },

    update() {
        // Hacks: ideally we could use mousedown and mouseup for all clicks and preventDefault to
        // avoid opening the browser's context menu. This hasn't worked for me so far when clicking
        // on a canvas, so I need to use the context menu event to capture a right mouse click instead.
        //
        // We fake a down/up for RMB clicks, which means we can't determine how long the RMB is held
        // (but luckily we don't need to for this game).
        if (this.releaseRMBTick) {
            this.releaseRMBTick--;
            if (this.releaseRMBTick === 0) {
                this.held[Input.Action.RELOAD] = false;
            }
        }
    },

    reset() {
        this.pointer = undefined;
        for (let action of Object.values(Input.Action)) {
            this.held[action] = false;
        }
    }
};
