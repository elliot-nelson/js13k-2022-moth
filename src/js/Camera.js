// Camera
//
// For now this is a very simple placeholder. Even if the camera never does
// anything but follow the player, distinguishing between "where the player is"
// and "what the map camera is looking at" is useful in other files.

import { Game } from './Game';
import { Input } from './input/Input';
import { Hud } from './Hud';
import { clamp, vectorBetween, vector2point } from './Util';

export const Camera = {
    init() {
        this.pos = { x: 0, y: 0 };
        this.forceTarget = undefined;
        this.vel = { x: 0, y: 0 };
    },

    update() {
        if (this.forceTarget) {
            let dist = vectorBetween(this.pos, this.forceTarget);

            if (dist.m < 1) {
                this.forceTarget = undefined;
                return;
            }

            dist.m = clamp(dist.m, 0, 2);

            let newVelocity = vector2point(dist);
            this.vel = {
                x: (this.vel.x + newVelocity.x) / 2,
                y: (this.vel.y + newVelocity.y) / 2
            };

            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
        }

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
