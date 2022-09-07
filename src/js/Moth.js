import { game } from './Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2, IDLE, DEAD, PICKUP, DROPOFF, MOVE } from './Constants';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point,
    uv2xy,
    xy2uv,
    qr2xy,
    centerxy,
    clamp
} from './Util';
import { Sprite } from './Sprite';
import { Gore } from './Gore';
import { World } from './World';
import { Viewport } from './Viewport';


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

        this.carryAmount = 0;
        this.carryCapacity = 500;
        this.carryPerFrame = 3;
        this.transferAmount = 0;

        this.frame = 0;
        this.circleOffset = Math.floor(Math.random() * 16);
    }

    think() {
        if (this.tasks.length === 0) {
            this.tasks.push({ task: IDLE });
        }
        let task = this.tasks[this.tasks.length - 1];

        this.frame = (Math.floor(game.frame / 8) % 2) + 1;

        if (this.state === DEAD) {
            this.cull = true;
            return;
        }

        if (task.task === MOVE) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            if (dist.m < 8) {
                this.tasks.pop();
            }
        } else if (task.task === PICKUP) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            if (dist.m < 8) {
                this.frame = 0;
                this.carryAmount += this.carryPerFrame;
                if (this.carryAmount >= this.carryCapacity) {
                    this.tasks.push({ task: DROPOFF, qr: { q: World.spawn.q, r: World.spawn.r } });
                }
            }
        } else if (task.task === DROPOFF) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            if (dist.m < 8) {
                this.frame = 0;

                this.carryAmount -= this.carryPerFrame;
                this.transferAmount += this.carryPerFrame;
                if (this.transferAmount >= 100) {
                    game.earth++;
                    this.transferAmount -= 100;
                }

                if (this.carryAmount <= 0) {
                    this.tasks.pop();
                }
            }
        }

        let dist = vectorBetween(this.pos, this.target);
        dist.m = clamp(dist.m, 0, 0.5);

        let newVelocity = vector2point(dist);

        this.vel = {
            x: (this.vel.x + newVelocity.x) / 2,
            y: (this.vel.y + newVelocity.y) / 2
        };
    }

    draw() {

        let r = 4;
        let uv = {
            u: Math.cos((game.frame + this.circleOffset) / 16) * r,
            v: Math.sin((game.frame + this.circleOffset) / 16) * r
        }

        Sprite.drawViewportSprite(Sprite.moth[this.frame], { x: this.pos.x + uv.u, y: this.pos.y + uv.v });

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }

    gather(qr) {
        //this.target = { x: qr.q * 8, y: qr.r * 8 };
        this.tasks = [
            { task: DROPOFF, qr: qr }
        ];
    }

    moveTo(qr) {
        this.tasks = [
            { task: MOVE, qr: qr }
        ];
    }

    isBusy() {
        return this.task && this.task.task !== IDLE;
    }
}
