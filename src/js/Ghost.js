// ghost?

import { game } from './Game';
import { R90, DIALOG_HINT_E1 } from './Constants';
import { vectorBetween, clamp, vector2angle } from './Util';
import { Sprite } from './Sprite';
import { CHASE, DEAD, ATTACK, RELOAD } from './systems/Behavior';
import { Gore } from './Gore';

import { Moth } from './Moth';

/**
 * Monster
 */
export class Ghost {
    constructor(pos) {
        this.pos = { ...pos };
        this.hp = 200;
        this.damage = [];
        this.vel = { x: 0, y: 0 };
        this.radius = 8;
        this.mass = 0.5;
        this.lastAttack = 0;
        this.state = CHASE;
        this.enemy = true;
    }

    think() {

        let targets = game.entities.filter(x => x instanceof Moth);
        let bestTarget = targets[0];
        let bestDiff = vectorBetween(this.pos, bestTarget.pos);
        for (let i = 1; i < targets.length; i++) {
            let diff = vectorBetween(this.pos, targets[i].pos);
            if (diff.m < bestDiff.m) {
                bestTarget = targets[i];
                bestDiff = diff;
            }
        }

        let diff = bestDiff;

        if (this.state === CHASE) {
           diff.m = clamp(diff.m, 0, 0.75);
           this.vel = {
                x: (this.vel.x + diff.x * diff.m) / 2,
                y: (this.vel.y + diff.y * diff.m) / 2
           };
        } else if (this.state === DEAD) {
            this.cull = true;
            Gore.kill(this);
        }
    }

    draw() {
        let sprite = Sprite.ghost[0];

        /*let sprite = Sprite.stabguts[((game.frame / 12) | 0) % 2];
        this.state === RELOAD && (sprite = Sprite.stabguts[2]);
        this.state === ATTACK && (sprite = Sprite.stabguts[3]);*/
        Sprite.drawViewportSprite(
            sprite,
            this.pos //,
            //this.facingAngle + R90
        );
    }
}
