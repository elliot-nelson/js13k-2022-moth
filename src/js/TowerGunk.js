import { game } from './Game';
import { R45, R90, R360 } from './Constants';
import { vector2angle, vector2point, angle2vector, vectorAdd, vectorBetween, clamp } from './Util';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';

export class TowerGunk {
    constructor(pos, target, damage) {
        this.pos = { ...pos };
        this.target = target;
        this.vel = { x: 0, y: 0 };
        this.damage = damage || 70;
    }

    think() {
        let diff = vectorBetween(this.pos, this.target.pos);
        diff.m = clamp(diff.m, 0, 2);
        this.vel = {
            x: (this.vel.x + diff.x * diff.m) / 2,
            y: (this.vel.y + diff.y * diff.m) / 2
        };

        if (diff.m < 1) {
            this.target.damage.push({ amount: this.damage, vector: diff, knockback: 1 });
            this.cull = true;
        }

        this.lastpos = this.pos;
    }

    draw() {
        if (this.lastpos) {
            Viewport.ctx.globalAlpha = 0.7;
            Sprite.drawViewportSprite(
                Sprite.bullet1[0],
                this.lastpos
            );
            Viewport.ctx.globalAlpha = 1;
        }

        Sprite.drawViewportSprite(
            Sprite.bullet1[0],
            this.pos
        );
    }
}
