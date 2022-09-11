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
    qr2xy
} from '../Util';
import { Sprite } from '../Sprite';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { SpawnMothAction } from '../actions/SpawnMothAction';

/**
 * Monster
 */
export class CoffinBuilding {
    constructor(qr) {
        this.qr = { ...qr };

        this.title = 'YOUR CORPSE \nLAST CHANCE';
        this.portraitSprite = Sprite.buildings[1];
        this.lightlevel = 9;
    }

    think() {
    }

    draw() {
        let xy = qr2xy(this.qr);

        //Viewport.ctx.drawImage(Sprite.tiles[tiles[y][x] - 1].img, x * 8 + offset.u, y * 8 + offset.v);
        Sprite.drawViewportSprite(Sprite.buildings[1], xy);

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }

    hudActions() {
        return [SpawnMothAction];
    }
}
