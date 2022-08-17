import { game } from './Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2 } from './Constants';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point,
    uv2xy,
    xy2uv
} from './Util';
import { Sprite } from './Sprite';
import { CHASE, DEAD } from './systems/Behavior';
import { Page } from './Page';
import { Gore } from './Gore';
import { Viewport } from './Viewport';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;

/**
 * Monster
 */
export class Moth {
    constructor(pos) {
        console.log(pos);
        this.pos = { ...pos };
        this.target = { ...this.pos };
        this.vel = { x: 0, y: 0 };
        this.hp = 1;
        this.damage = [];
        this.radius = 3;
        this.state = IDLE;

        this.offset = { x: 0, y: 0 };
    }

    think() {
        let dist = vectorBetween(this.pos, this.target);
        dist.m = Math.max(dist.m, 1);

        let newVelocity = vector2point(dist);

        this.vel = {
            x: (this.vel.x + newVelocity.x) / 2,
            y: (this.vel.y + newVelocity.y) / 2
        };
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.moth[0], this.pos);

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }
}
