import { game } from '../Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2, WIP, ONLINE } from '../Constants';
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
    centerxy,
    clamp
} from '../Util';
import { Sprite } from '../Sprite';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { TowerGunk } from '../TowerGunk';
import { BuildTowerAction } from '../actions/BuildTowerAction';
import { Audio } from '../Audio';

/**
 * Monster
 */
export class TowerBuilding {
    constructor(qr) {
        this.qr = { ...qr };
        this.framesToNextShot = 10;

        this.lightlevel = 7;

        this.state = WIP;
        this.buildFrames = 0;
        this.buildFramesTotal = 180;

        this.title = 'TOWER';
        this.portraitSprite = Sprite.buildings[0];
    }

    think() {
        if (this.buildFrames >= this.buildFramesTotal) {
            this.state = ONLINE;
        }

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
            Audio.play(Audio.towerShoot);
        }
    }

    draw() {
        let xy = qr2xy(this.qr);
        let uv = xy2uv(centerxy(xy));

        //Viewport.ctx.drawImage(Sprite.tiles[tiles[y][x] - 1].img, x * 8 + offset.u, y * 8 + offset.v);

        Viewport.ctx.globalAlpha = this.state === WIP ? 0.5 : 1;
        Sprite.drawViewportSprite(Sprite.buildings[0], xy);
        Viewport.ctx.globalAlpha = 1;

        /*
        Viewport.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        Viewport.ctx.beginPath();
        Viewport.ctx.arc(uv.u, uv.v, 4, 0, 2 * Math.PI * 0.7);
        Viewport.ctx.fill();
        */

        if (this.state === WIP) {
            let progress = clamp(Math.floor(8 * this.buildFrames / this.buildFramesTotal), 0, 7);

            Viewport.ctx.globalAlpha = 0.5;
            Sprite.drawViewportSprite(Sprite.hud_wip[7], xy);
            Viewport.ctx.globalAlpha = 1;
            Sprite.drawViewportSprite(Sprite.hud_wip[progress], xy);
        }

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }

    hudActions() {
        if (this.buildFrames < this.buildFramesTotal) {
            return [BuildTowerAction];
        } else {
            return [];
        }
    }
}
