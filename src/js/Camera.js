// Camera
//
// For now this is a very simple placeholder. Even if the camera never does
// anything but follow the player, distinguishing between "where the player is"
// and "what the map camera is looking at" is useful in other files.

import { Game } from './Game';
import { Input } from './input/Input';
import { Hud } from './Hud';

export const Camera = {
    init() {
        this.pos = { x: 0, y: 0, z: 0 };
    },

    update() {
        if (Input.pressed[Input.Action.RAW_TOUCH]) {
            this.dragStart = { ...this.pos };
        }

        if (Input.dragging) {
            this.pos = {
                x: this.dragStart.x - Input.dragVector.x,
                y: this.dragStart.y - Input.dragVector.y
            }
        }

        //this.pos = Game.player.pos;
        //this.pos = { x: 0, y: 0, z: 0 };
    }
};
