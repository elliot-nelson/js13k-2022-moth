import { game } from './Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2 } from './Constants';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point,
    uv2xy,
    xy2uv,
    qr2xy,
    centerxy
} from './Util';
import { Sprite } from './Sprite';
import { CHASE, DEAD } from './systems/Behavior';
import { Gore } from './Gore';
import { World } from './World';
import { Viewport } from './Viewport';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;
const GATHER = 4;
const RETURN = 5;


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
        this.noClipEntity = true;
        this.noClipWall = true;

        this.tasks = [];
        this.carrying = 0;

        this.offset = { x: 0, y: 0 };
    }

    think() {
        let task = this.tasks[this.tasks.length - 1] || { task: IDLE };

        if (task.task === GATHER) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            if (dist.m < 8) {
                this.carrying++;
                console.log(this.carrying);
                if (this.carrying > 100) {
                    this.tasks.push({ task: RETURN, qr: { q: World.spawn.q, r: World.spawn.r } });
                }
            }
        } else if (task.task === RETURN) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            if (dist.m < 8) {
                this.carrying--;
                game.earth++;

                if (this.carrying <= 0) {
                    this.tasks.pop();
                }
            }
        }

        let dist = vectorBetween(this.pos, this.target);
        dist.m = Math.min(dist.m, 1);

        let newVelocity = vector2point(dist);

        this.vel = {
            x: (this.vel.x + newVelocity.x) / 2,
            y: (this.vel.y + newVelocity.y) / 2
        };
    }

    draw() {
        let uv = {
            u: ((Math.random() * 3) | 0) - 1,
            v: ((Math.random() * 3) | 0) - 1
        };
        Sprite.drawViewportSprite(Sprite.moth[0], { x: this.pos.x + uv.u, y: this.pos.y + uv.v });

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }

    gather(qr) {
        //this.target = { x: qr.q * 8, y: qr.r * 8 };
        this.tasks = [
            { task: GATHER, qr: qr }
        ];
    }
}
