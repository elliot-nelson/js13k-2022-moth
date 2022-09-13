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
    clamp,
    centerxy
} from '../Util';
import { Sprite } from '../Sprite';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { SpawnMothAction } from '../actions/SpawnMothAction';
import { TeleportCoffinAction } from '../actions/TeleportCoffinAction';
import { Audio } from '../Audio';
import { AttackAnimation } from '../AttackAnimation';
import { World } from '../World';

/**
 * Monster
 */
export class CoffinBuilding {
    constructor(qr, initialSpawn) {
        this.qr = { ...qr };

        this.state = WIP;
        this.buildFrames = 0;
        this.buildFramesTotal = 180;

        if (initialSpawn) {
            this.buildFrames = 180;
            this.state = ONLINE;
        }

        this.title = 'YOUR COFFIN \nIXNA VALRI';
        this.portraitSprite = Sprite.buildings[1];
        this.lightlevel = 9;
    }

    think() {
        if (this.buildFrames >= this.buildFramesTotal) {
            if (this.state !== ONLINE) {
                this.state = ONLINE;
                Audio.play(Audio.buildingFinished);
                for (let building of World.buildings) {
                    if (building instanceof CoffinBuilding && building !== this) {
                        game.entities.push(new AttackAnimation(centerxy(qr2xy(building.qr))));
                        building.cull = true;
                    }
                }
                World.spawn = { ...this.qr };
            }
        } else {
            return;
        }
    }

    draw() {
        let xy = qr2xy(this.qr);

        //Viewport.ctx.drawImage(Sprite.tiles[tiles[y][x] - 1].img, x * 8 + offset.u, y * 8 + offset.v);
        Sprite.drawViewportSprite(Sprite.buildings[1], xy);

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
        if (this.state === WIP) {
            let progress = clamp(Math.floor(8 * this.buildFrames / this.buildFramesTotal), 0, 7);

            Viewport.ctx.globalAlpha = 0.5;
            Sprite.drawViewportSprite(Sprite.hud_wip[7], xy);
            Viewport.ctx.globalAlpha = 1;
            Sprite.drawViewportSprite(Sprite.hud_wip[progress], xy);
        }
    }

    hudActions() {
        if (this.buildFrames < this.buildFramesTotal) {
            return [TeleportCoffinAction];
        } else {
            return [SpawnMothAction];
        }
    }
}
