import { game } from './Game';
import { R45, R90, R360 } from './Constants';
import { vector2angle, vector2point, angle2vector, vectorAdd, vectorBetween, clamp } from './Util';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';
import { Player } from './Player';

export class TowerGunk {
    constructor(pos, target) {
        this.pos = { ...pos };
        this.target = target;
        this.vel = { x: 0, y: 0 };
    }

    think() {
        let diff = vectorBetween(this.pos, this.target.pos);
        diff.m = clamp(diff.m, 0, 3);
        this.vel = {
            x: (this.vel.x + diff.x * diff.m) / 2,
            y: (this.vel.y + diff.y * diff.m) / 2
        };
    }

    draw() {
        Sprite.drawViewportSprite(
            Sprite.gore[0],
            this.pos,
            this.r
        );
    }
}
