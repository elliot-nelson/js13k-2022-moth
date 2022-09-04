import { game } from '../Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2 } from '../Constants';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point,
    uv2xy,
    xy2uv,
    qr2xy,
    xy2qr,
    centerxy
} from '../Util';
import { Sprite } from '../Sprite';
import { CHASE, DEAD } from '../systems/Behavior';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { TowerGunk } from '../TowerGunk';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;

/**
 * Monster
 */
export class TowerBuilding {
    constructor(qr) {
        this.qr = { ...qr };
        this.framesToNextShot = 10;

        this.title = 'TOWER';
        this.portraitSprite = Sprite.buildings[0];
    }

    think() {
        let xy = centerxy(qr2xy(this.qr));

        let closestTarget, closestVector;

        if (!this.target || this.target.cull) {
            for (let entity of game.entities) {
                if (!entity.enemy) continue;

                //let qr = xy2qr(entity.pos);
                let v = vectorBetween(xy, entity.pos);
                if (v.m < 32 && (!closestVector || v.m < closestVector.m)) {
                    closestTarget = entity;
                    closestVector = v;
                }
            }

            console.log('ATTEMPTED to pick target for building', closestTarget);
            this.target = closestTarget;
        }

        if (this.framesToNextShot > 0) {
            this.framesToNextShot--;
        }

        if (this.target && this.framesToNextShot === 0) {
            let v = vectorBetween(xy, this.target);
            game.entities.push(new TowerGunk(xy, this.target));
            this.framesToNextShot = 100;
        }
    }

    draw() {
        let xy = qr2xy(this.qr);

        //Viewport.ctx.drawImage(Sprite.tiles[tiles[y][x] - 1].img, x * 8 + offset.u, y * 8 + offset.v);
        Sprite.drawViewportSprite(Sprite.buildings[0], xy);

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }

    hudActions() {
        return [];
    }
}
