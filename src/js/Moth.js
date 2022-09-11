import { game } from './Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2, IDLE, DEAD, PICKUP, DROPOFF, MOVE, CONSTRUCT, ACTION_DISTANCE } from './Constants';
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
    clamp,
    xy2qr
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
        this.pos = { ...pos };
        this.target = { ...this.pos };
        this.vel = { x: 0, y: 0 };
        this.hp = 1;
        this.damage = [];
        this.radius = 3;
        this.state = IDLE;
        this.noClipEntity = true;
        this.noClipWall = true;

        this.lightlevel = 7;

        this.tasks = [];
        this.carrying = 0;

        this.offset = { x: 0, y: 0 };

        this.carryAmount = 0;
        this.carryCapacity = 5_00;
        this.carryPerFrame = 3;
        this.transferAmount = 0;

        this.frame = 0;
        this.circleOffset = Math.floor(Math.random() * 16);

        this.lastAssigned = game.frame;

        let qr = xy2qr(this.pos);
        this.moveTo({ q: qr.q, r: qr.r - 1 });
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

            if (dist.m < ACTION_DISTANCE) {
                this.tasks.pop();
            }
        } else if (task.task === CONSTRUCT) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            if (dist.m < ACTION_DISTANCE) {
                this.frame = 0;
                let building = World.buildingAt(task.qr);
                building.buildFrames++;
                if (building.buildFrames >= building.buildFramesTotal) {
                    this.tasks.pop();
                }
            }
        } else if (task.task === PICKUP) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            let building = World.buildingAt(task.qr);

            if (!building) {
                this.tasks.pop();
                this.tasks.push({ task: DROPOFF, qr: { q: World.spawn.q, r: World.spawn.r } });
            } else if (dist.m < ACTION_DISTANCE) {
                this.frame = 0;
                this.carryAmount += this.carryPerFrame;
                building.resourcesLeft -= this.carryPerFrame;
                if (this.carryAmount >= this.carryCapacity) {
                    this.tasks.push({ task: DROPOFF, qr: { q: World.spawn.q, r: World.spawn.r } });
                }
            }
        } else if (task.task === DROPOFF) {
            this.target = centerxy(qr2xy(task.qr));
            let dist = vectorBetween(this.pos, this.target);

            if (dist.m < ACTION_DISTANCE) {
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

        let pathToTarget = World.pathToTarget(this.pos, this.target);
        console.log([this.target, pathToTarget]);
        let dist = vectorBetween(this.pos, pathToTarget);
        dist.m = clamp(dist.m, 0, 0.5);

        let newVelocity = vector2point(dist);

        this.vel = {
            x: (this.vel.x + newVelocity.x) / 2,
            y: (this.vel.y + newVelocity.y) / 2
        };
    }

    draw() {
        let r = 3;
        if (this.frame === 0) r--;

        let uv = {
            u: Math.cos((game.frame + this.circleOffset) / 16) * r,
            v: Math.sin((game.frame + this.circleOffset) / 16) * 1
        }

        Sprite.drawViewportSprite(Sprite.moth[this.frame], { x: this.pos.x + uv.u, y: this.pos.y + uv.v });

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }

    gather(qr) {
        //this.target = { x: qr.q * 8, y: qr.r * 8 };
        this.tasks = [
            { task: PICKUP, qr: qr }
        ];
        this.lastAssigned = game.frame;
    }

    construct(qr) {
        //this.target = { x: qr.q * 8, y: qr.r * 8 };
        this.tasks.push(
            { task: CONSTRUCT, qr: qr }
        );
        this.lastAssigned = game.frame;
    }

    moveTo(qr) {
        this.tasks = [
            { task: MOVE, qr: qr }
        ];
        this.lastAssigned = game.frame;
    }

    isBusy() {
        let task = this.tasks[this.tasks.length - 1];
        return task && task.task !== IDLE;
    }
}

Moth.sortMoths = () => {
    let moths = game.entities.filter(e => e instanceof Moth);
    moths.sort((a, b) => {
        if (a.isBusy() && !b.isBusy()) {
            return 1;
        } else if (!a.isBusy() && b.isBusy()) {
            return -1;
        } else {
            return a.lastAssigned - b.lastAssigned;
        }
    });
    return moths;
};

Moth.assign = (fn) => {
    let moths = Moth.sortMoths();

    for (let i = 0; i < moths.length; i++) {
        if (i > 0 && moths[i].isBusy()) break;
        fn(moths[i]);
    }
};
